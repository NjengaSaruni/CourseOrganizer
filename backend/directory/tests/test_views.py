import pytest
import json
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from factory import Faker
from factory.django import DjangoModelFactory
from directory.models import User, AcademicYear, Semester, StudentClass
from directory.tests.test_models import UserFactory, AcademicYearFactory, SemesterFactory, StudentClassFactory

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistrationAPI(APITestCase):
    """Test cases for user registration API"""

    def setUp(self):
        self.client = APIClient()
        self.registration_url = reverse('user-registration')

    def test_user_registration_success(self):
        """Test successful user registration"""
        data = {
            'email': 'test@example.com',
            'full_name': 'Test User',
            'registration_number': 'GPR1234',
            'phone_number': '+254712345678',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        
        response = self.client.post(self.registration_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='test@example.com').exists())

    def test_user_registration_duplicate_email(self):
        """Test registration with duplicate email"""
        UserFactory(email='existing@example.com')
        
        data = {
            'email': 'existing@example.com',
            'full_name': 'Test User',
            'registration_number': 'GPR1234',
            'phone_number': '+254712345678',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        
        response = self.client.post(self.registration_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_password_mismatch(self):
        """Test registration with password mismatch"""
        data = {
            'email': 'test@example.com',
            'full_name': 'Test User',
            'registration_number': 'GPR1234',
            'phone_number': '+254712345678',
            'password': 'testpass123',
            'password_confirm': 'differentpass'
        }
        
        response = self.client.post(self.registration_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_missing_fields(self):
        """Test registration with missing required fields"""
        data = {
            'email': 'test@example.com',
            'full_name': 'Test User',
            # Missing registration_number, phone_number, passwords
        }
        
        response = self.client.post(self.registration_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@pytest.mark.django_db
class TestUserLoginAPI(APITestCase):
    """Test cases for user login API"""

    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse('user-login')
        self.user = UserFactory()
        self.user.set_password('testpass123')
        self.user.save()

    def test_user_login_success(self):
        """Test successful user login"""
        data = {
            'email': self.user.email,
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)

    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {
            'email': self.user.email,
            'password': 'wrongpassword'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_nonexistent_user(self):
        """Test login with nonexistent user"""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@pytest.mark.django_db
class TestUserProfileAPI(APITestCase):
    """Test cases for user profile API"""

    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.profile_url = reverse('user-profile')

    def test_get_user_profile(self):
        """Test getting user profile"""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)

    def test_update_user_profile(self):
        """Test updating user profile"""
        data = {
            'full_name': 'Updated Name',
            'phone_number': '+254798765432'
        }
        
        response = self.client.patch(self.profile_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, 'Updated Name')
        self.assertEqual(self.user.phone_number, '+254798765432')

    def test_profile_access_without_auth(self):
        """Test profile access without authentication"""
        self.client.credentials()
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@pytest.mark.django_db
class TestAcademicYearAPI(APITestCase):
    """Test cases for Academic Year API"""

    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.academic_years_url = reverse('academic-years-list')

    def test_get_academic_years(self):
        """Test getting list of academic years"""
        AcademicYearFactory()
        AcademicYearFactory(year_start=2024, year_end=2025)
        
        response = self.client.get(self.academic_years_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_active_academic_year(self):
        """Test getting active academic year"""
        active_year = AcademicYearFactory(is_active=True)
        AcademicYearFactory(is_active=False)
        
        response = self.client.get(self.academic_years_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that active year is returned
        active_years = [year for year in response.data if year['is_active']]
        self.assertEqual(len(active_years), 1)
        self.assertEqual(active_years[0]['id'], active_year.id)


@pytest.mark.django_db
class TestSemesterAPI(APITestCase):
    """Test cases for Semester API"""

    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.semesters_url = reverse('semesters-list')

    def test_get_semesters(self):
        """Test getting list of semesters"""
        academic_year = AcademicYearFactory()
        SemesterFactory(academic_year=academic_year, semester_type='FIRST')
        SemesterFactory(academic_year=academic_year, semester_type='SECOND')
        
        response = self.client.get(self.semesters_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_active_semester(self):
        """Test getting active semester"""
        academic_year = AcademicYearFactory()
        active_semester = SemesterFactory(academic_year=academic_year, is_active=True)
        SemesterFactory(academic_year=academic_year, is_active=False)
        
        response = self.client.get(self.semesters_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that active semester is returned
        active_semesters = [sem for sem in response.data if sem['is_active']]
        self.assertEqual(len(active_semesters), 1)
        self.assertEqual(active_semesters[0]['id'], active_semester.id)
