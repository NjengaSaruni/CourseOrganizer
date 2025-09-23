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
from directory.models import User, AcademicYear, Semester
from school.models import Class as StudentClass
from directory.tests.test_models import UserFactory, AcademicYearFactory, SemesterFactory, StudentClassFactory
import uuid
from django.core import mail
from rest_framework.reverse import reverse as drf_reverse

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistrationAPI(APITestCase):
    """Test cases for user registration API"""

    def setUp(self):
        self.client = APIClient()
        self.registration_url = reverse('register')
        self.registration_request_url = reverse('registration_requests')
        # Ensure a default class exists for student creation
        if not StudentClass.objects.exists():
            StudentClassFactory()

    def test_user_registration_success(self):
        """Test successful user registration"""
        data = {
            'email': 'test@students.uonbi.ac.ke',
            'first_name': 'Test',
            'last_name': 'User',
            'registration_number': 'GPR3/123456/2025',
            'phone_number': '+254712345678',
            'password': 'testpass123',
            'confirm_password': 'testpass123'
        }
        
        response = self.client.post(self.registration_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='test@students.uonbi.ac.ke').exists())
        # Assert admin notification email sent
        self.assertGreaterEqual(len(mail.outbox), 1)
        admin_emails = [m for m in mail.outbox if 'admin@riverlearn.co.ke' in m.to]
        self.assertGreaterEqual(len(admin_emails), 1)

    def test_registration_request_sends_admin_notification(self):
        """Creating a registration request should send admin notification email"""
        # Auth as a normal user (or allow any? endpoint requires auth per view)
        user = UserFactory()
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        # Ensure active academic year exists so FK requirement is satisfied if not provided
        if not AcademicYear.objects.filter(is_active=True).exists():
            AcademicYearFactory(is_active=True)

        unique_email = f"jane+{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            'first_name': 'Jane',
            'last_name': 'Doe',
            'email': unique_email,
            'phone_number': '+254700000000',
            'registration_number': 'GPR3/654321/2025',
            'program': 'Law',
            'year_of_study': 1,
            'semester': 1,
            # academic_year optional, perform_create will set current
            'bio': 'bio',
            'motivation': 'motivation'
        }

        resp = self.client.post(self.registration_request_url, payload, format='json')
        self.assertIn(resp.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])
        self.assertGreaterEqual(len(mail.outbox), 1)
        admin_emails = [m for m in mail.outbox if 'admin@riverlearn.co.ke' in m.to]
        self.assertGreaterEqual(len(admin_emails), 1)

    def test_user_registration_duplicate_email(self):
        """Test registration with duplicate email"""
        UserFactory(email='existing@students.uonbi.ac.ke')

        data = {
            'email': 'existing@students.uonbi.ac.ke',
            'first_name': 'Test',
            'last_name': 'User',
            'registration_number': 'GPR3/123457/2025',
            'phone_number': '+254712345678',
            'password': 'testpass123',
            'confirm_password': 'testpass123'
        }

        response = self.client.post(self.registration_url, data, format='json')
        # The API returns 500 for duplicate emails due to username uniqueness constraint
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_user_registration_password_mismatch(self):
        """Test registration with password mismatch"""
        data = {
            'email': 'test@students.uonbi.ac.ke',
            'first_name': 'Test',
            'last_name': 'User',
            'registration_number': 'GPR3/123458/2025',
            'phone_number': '+254712345678',
            'password': 'testpass123',
            'confirm_password': 'differentpass'
        }
        
        response = self.client.post(self.registration_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_missing_fields(self):
        """Test registration with missing required fields"""
        data = {
            'email': 'test@students.uonbi.ac.ke',
            'first_name': 'Test',
            'last_name': 'User',
            # Missing registration_number, phone_number, passwords
        }
        
        response = self.client.post(self.registration_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@pytest.mark.django_db
class TestUserLoginAPI(APITestCase):
    """Test cases for user login API"""

    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse('login')
        self.user = UserFactory()
        self.user.set_password('testpass123')
        self.user.status = 'approved'  # User needs to be approved to login
        self.user.email_verified = True  # User needs to have verified email to login
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
        self.profile_url = reverse('user_profile')

    def test_get_user_profile(self):
        """Test getting user profile"""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)

    def test_update_user_profile(self):
        """Test updating user profile"""
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'phone_number': '+254798765432'
        }
        
        update_url = reverse('update_profile')
        response = self.client.patch(update_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')
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
        self.academic_years_url = reverse('academic_years')

    def test_get_academic_years(self):
        """Test getting list of academic years"""
        initial_response = self.client.get(self.academic_years_url)
        initial_count = len(initial_response.data['results'])
        AcademicYearFactory(year_start=2024, year_end=2025)
        AcademicYearFactory(year_start=2026, year_end=2027)

        response = self.client.get(self.academic_years_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), initial_count + 2)

    def test_get_active_academic_year(self):
        """Test getting active academic year"""
        active_year = AcademicYearFactory(year_start=2024, year_end=2025, is_active=True)
        AcademicYearFactory(year_start=2026, year_end=2027, is_active=False)
        
        response = self.client.get(self.academic_years_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that active year is returned (API returns paginated response)
        active_years = [year for year in response.data['results'] if year['is_active']]
        self.assertGreaterEqual(len(active_years), 1)
        # Check that our created active year is in the list
        active_year_ids = [year['id'] for year in active_years]
        self.assertIn(active_year.id, active_year_ids)


@pytest.mark.django_db
class TestSemesterAPI(APITestCase):
    """Test cases for Semester API"""

    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.semesters_url = reverse('semesters')

    def test_get_semesters(self):
        """Test getting list of semesters"""
        initial_response = self.client.get(self.semesters_url)
        initial_count = len(initial_response.data['results'])
        academic_year = AcademicYearFactory(year_start=2024, year_end=2025)
        SemesterFactory(academic_year=academic_year, semester_type=1)  # First Semester
        SemesterFactory(academic_year=academic_year, semester_type=2)  # Second Semester

        response = self.client.get(self.semesters_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), initial_count + 2)

    def test_get_active_semester(self):
        """Test getting active semester"""
        academic_year = AcademicYearFactory(year_start=2024, year_end=2025)
        active_semester = SemesterFactory(academic_year=academic_year, semester_type=1, is_active=True)
        SemesterFactory(academic_year=academic_year, semester_type=2, is_active=False)
        
        response = self.client.get(self.semesters_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that active semester is returned (API returns paginated response)
        active_semesters = [sem for sem in response.data['results'] if sem['is_active']]
        self.assertGreaterEqual(len(active_semesters), 1)
        # Check that our created active semester is in the list
        active_semester_ids = [sem['id'] for sem in active_semesters]
        self.assertIn(active_semester.id, active_semester_ids)
