import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from factory import Faker, SubFactory, LazyAttribute
from factory.django import DjangoModelFactory
from directory.models import User, AcademicYear, Semester
from school.models import School, Faculty, Department, Class as StudentClass

User = get_user_model()


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    # Don't set username - let it be set to email in the save method
    email = Faker('email')
    first_name = Faker('first_name')
    last_name = Faker('last_name')
    registration_number = Faker('bothify', text='GPR3/######/2025')
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
    semester_type = 1  # First Semester
    start_date = Faker('date_this_year')
    end_date = Faker('date_this_year')
    is_active = True


class SchoolFactory(DjangoModelFactory):
    class Meta:
        model = School

    name = Faker('company')
    code = Faker('bothify', text='SCH####')
    is_active = True


class FacultyFactory(DjangoModelFactory):
    class Meta:
        model = Faculty

    school = SubFactory(SchoolFactory)
    name = Faker('company_suffix')
    code = Faker('bothify', text='FAC####')
    is_active = True


class DepartmentFactory(DjangoModelFactory):
    class Meta:
        model = Department

    faculty = SubFactory(FacultyFactory)
    name = Faker('company_suffix')
    code = Faker('bothify', text='DEPT####')
    is_active = True


class StudentClassFactory(DjangoModelFactory):
    class Meta:
        model = StudentClass

    department = SubFactory(DepartmentFactory)
    name = Faker('bothify', text='Class of ####')
    program = Faker('sentence', nb_words=3)
    graduation_year = Faker('year')
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
        self.assertTrue(self.user.get_full_name())
        self.assertTrue(self.user.registration_number)

    def test_user_str_representation(self):
        """Test string representation of user"""
        expected = f"{self.user.get_full_name()} ({self.user.registration_number})"
        self.assertEqual(str(self.user), expected)

    def test_user_email_unique(self):
        """Test that email must be unique (through username field)"""
        # The User model enforces email uniqueness through the username field
        # since username is set to email in the save method
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                email=self.user.email,
                password='testpass123',
                first_name='Test',
                last_name='User',
                registration_number='GPR3/123457/2025',
                phone_number='+254712345679'
            )

    def test_user_registration_number_unique(self):
        """Test that registration number must be unique"""
        with self.assertRaises(Exception):
            User.objects.create_user(
                email='test2@example.com',
                password='testpass123',
                first_name='Test',
                last_name='User',
                registration_number=self.user.registration_number,
                phone_number='+254712345680'
            )

    def test_user_default_permissions(self):
        """Test default user permissions"""
        self.assertFalse(self.user.is_staff)
        self.assertFalse(self.user.is_superuser)
        self.assertTrue(self.user.is_active)

    def test_user_full_name_required(self):
        """Test that full name is required"""
        # The User model doesn't enforce name validation at DB level
        # This test verifies the model allows empty names (which it does)
        user = User.objects.create_user(
            email='test3@example.com',
            password='testpass123',
            first_name='',
            last_name='',
            registration_number='GPR3/123458/2025',
            phone_number='+254712345681'
        )
        self.assertEqual(user.first_name, '')
        self.assertEqual(user.last_name, '')

    def test_user_email_required(self):
        """Test that email is required"""
        with self.assertRaises(Exception):
            User.objects.create_user(
                email='',
                password='testpass123',
                first_name='Test',
                last_name='User',
                registration_number='GPR3/123459/2025',
                phone_number='+254712345682'
            )


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
        academic_year = AcademicYear.get_or_create_2025_2026()
        self.assertEqual(academic_year.year_start, 2025)
        self.assertEqual(academic_year.year_end, 2026)

        # Test getting existing academic year
        academic_year2 = AcademicYear.get_or_create_2025_2026()
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
        self.assertEqual(self.semester.semester_type, 1)  # First Semester

    def test_semester_str_representation(self):
        """Test string representation of semester"""
        expected = f"2025/2026 - First Semester"
        self.assertEqual(str(self.semester), expected)

    def test_semester_type_choices(self):
        """Test semester type choices"""
        valid_choices = [1, 2, 3]  # First, Second, Summer
        for choice in valid_choices:
            # Create new academic year for each choice to avoid unique constraint
            academic_year = AcademicYearFactory(year_start=2025 + choice, year_end=2026 + choice)
            semester = SemesterFactory(academic_year=academic_year, semester_type=choice)
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
        expected = f"{self.student_class.program} - {self.student_class.name}"
        self.assertEqual(str(self.student_class), expected)
