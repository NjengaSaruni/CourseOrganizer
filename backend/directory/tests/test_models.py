import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from factory import Faker, SubFactory, LazyAttribute
from factory.django import DjangoModelFactory
from directory.models import User, AcademicYear, Semester, StudentClass

User = get_user_model()


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    email = Faker('email')
    full_name = Faker('name')
    registration_number = Faker('bothify', text='GPR####')
    phone_number = Faker('phone_number')
    is_active = True
    is_staff = False
    is_superuser = False


class AcademicYearFactory(DjangoModelFactory):
    class Meta:
        model = AcademicYear

    year_start = 2025
    year_end = 2026
    is_active = True


class SemesterFactory(DjangoModelFactory):
    class Meta:
        model = Semester

    academic_year = SubFactory(AcademicYearFactory)
    semester_type = 'FIRST'
    start_date = Faker('date_this_year')
    end_date = Faker('date_this_year')
    is_active = True


class StudentClassFactory(DjangoModelFactory):
    class Meta:
        model = StudentClass

    name = Faker('bothify', text='Class of ####')
    academic_year = SubFactory(AcademicYearFactory)
    is_active = True


@pytest.mark.django_db
class TestUserModel(TestCase):
    """Test cases for User model"""

    def setUp(self):
        self.user = UserFactory()

    def test_user_creation(self):
        """Test user creation with required fields"""
        self.assertIsInstance(self.user, User)
        self.assertTrue(self.user.email)
        self.assertTrue(self.user.full_name)
        self.assertTrue(self.user.registration_number)

    def test_user_str_representation(self):
        """Test string representation of user"""
        expected = f"{self.user.full_name} ({self.user.registration_number})"
        self.assertEqual(str(self.user), expected)

    def test_user_email_unique(self):
        """Test that email must be unique"""
        with self.assertRaises(Exception):
            UserFactory(email=self.user.email)

    def test_user_registration_number_unique(self):
        """Test that registration number must be unique"""
        with self.assertRaises(Exception):
            UserFactory(registration_number=self.user.registration_number)

    def test_user_default_permissions(self):
        """Test default user permissions"""
        self.assertFalse(self.user.is_staff)
        self.assertFalse(self.user.is_superuser)
        self.assertTrue(self.user.is_active)

    def test_user_full_name_required(self):
        """Test that full name is required"""
        with self.assertRaises(Exception):
            UserFactory(full_name='')

    def test_user_email_required(self):
        """Test that email is required"""
        with self.assertRaises(Exception):
            UserFactory(email='')


@pytest.mark.django_db
class TestAcademicYearModel(TestCase):
    """Test cases for AcademicYear model"""

    def setUp(self):
        self.academic_year = AcademicYearFactory()

    def test_academic_year_creation(self):
        """Test academic year creation"""
        self.assertIsInstance(self.academic_year, AcademicYear)
        self.assertEqual(self.academic_year.year_start, 2025)
        self.assertEqual(self.academic_year.year_end, 2026)

    def test_academic_year_str_representation(self):
        """Test string representation of academic year"""
        expected = "2025/2026"
        self.assertEqual(str(self.academic_year), expected)

    def test_academic_year_get_or_create_2025_2026(self):
        """Test the get_or_create_2025_2026 class method"""
        # Test creating new academic year
        academic_year, created = AcademicYear.get_or_create_2025_2026()
        self.assertTrue(created)
        self.assertEqual(academic_year.year_start, 2025)
        self.assertEqual(academic_year.year_end, 2026)

        # Test getting existing academic year
        academic_year2, created2 = AcademicYear.get_or_create_2025_2026()
        self.assertFalse(created2)
        self.assertEqual(academic_year.id, academic_year2.id)


@pytest.mark.django_db
class TestSemesterModel(TestCase):
    """Test cases for Semester model"""

    def setUp(self):
        self.academic_year = AcademicYearFactory()
        self.semester = SemesterFactory(academic_year=self.academic_year)

    def test_semester_creation(self):
        """Test semester creation"""
        self.assertIsInstance(self.semester, Semester)
        self.assertEqual(self.semester.academic_year, self.academic_year)
        self.assertEqual(self.semester.semester_type, 'FIRST')

    def test_semester_str_representation(self):
        """Test string representation of semester"""
        expected = f"2025/2026 - First Semester"
        self.assertEqual(str(self.semester), expected)

    def test_semester_type_choices(self):
        """Test semester type choices"""
        valid_choices = ['FIRST', 'SECOND', 'THIRD']
        for choice in valid_choices:
            semester = SemesterFactory(semester_type=choice)
            self.assertEqual(semester.semester_type, choice)


@pytest.mark.django_db
class TestStudentClassModel(TestCase):
    """Test cases for StudentClass model"""

    def setUp(self):
        self.academic_year = AcademicYearFactory()
        self.student_class = StudentClassFactory(academic_year=self.academic_year)

    def test_student_class_creation(self):
        """Test student class creation"""
        self.assertIsInstance(self.student_class, StudentClass)
        self.assertEqual(self.student_class.academic_year, self.academic_year)
        self.assertTrue(self.student_class.name)

    def test_student_class_str_representation(self):
        """Test string representation of student class"""
        expected = f"{self.student_class.name} (2025/2026)"
        self.assertEqual(str(self.student_class), expected)
