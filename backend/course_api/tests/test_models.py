import pytest
from django.test import TestCase
from django.core.exceptions import ValidationError
from factory import Faker, SubFactory, LazyAttribute
from factory.django import DjangoModelFactory
from course_api.models import Course, Meeting, CourseContent
from directory.tests.test_models import UserFactory, AcademicYearFactory, SemesterFactory


class CourseFactory(DjangoModelFactory):
    class Meta:
        model = Course

    name = Faker('sentence', nb_words=3)
    code = Faker('bothify', text='GPR####')
    description = Faker('text', max_nb_chars=200)
    credits = 3
    is_active = True


class MeetingFactory(DjangoModelFactory):
    class Meta:
        model = Meeting

    title = Faker('sentence', nb_words=4)
    description = Faker('text', max_nb_chars=300)
    course = SubFactory(CourseFactory)
    instructor = SubFactory(UserFactory)
    start_time = Faker('future_datetime', end_date='+30d')
    duration_minutes = 60
    is_recording_enabled = True
    is_auto_created = False


class CourseContentFactory(DjangoModelFactory):
    class Meta:
        model = CourseContent

    title = Faker('sentence', nb_words=4)
    description = Faker('text', max_nb_chars=200)
    course = SubFactory(CourseFactory)
    academic_year = SubFactory(AcademicYearFactory)
    semester = SubFactory(SemesterFactory)
    content_type = 'material'
    is_published = True


@pytest.mark.django_db
class TestCourseModel(TestCase):
    """Test cases for Course model"""

    def setUp(self):
        self.course = CourseFactory()

    def test_course_creation(self):
        """Test course creation with required fields"""
        self.assertIsInstance(self.course, Course)
        self.assertTrue(self.course.name)
        self.assertTrue(self.course.code)
        self.assertTrue(self.course.description)

    def test_course_str_representation(self):
        """Test string representation of course"""
        expected = f"{self.course.code} - {self.course.name}"
        self.assertEqual(str(self.course), expected)

    def test_course_code_unique(self):
        """Test that course code must be unique"""
        with self.assertRaises(Exception):
            CourseFactory(code=self.course.code)

    def test_course_default_values(self):
        """Test default values for course"""
        self.assertEqual(self.course.credits, 3)
        self.assertTrue(self.course.is_active)

    def test_course_name_required(self):
        """Test that course name is required"""
        with self.assertRaises(Exception):
            CourseFactory(name='')

    def test_course_code_required(self):
        """Test that course code is required"""
        with self.assertRaises(Exception):
            CourseFactory(code='')


@pytest.mark.django_db
class TestMeetingModel(TestCase):
    """Test cases for Meeting model"""

    def setUp(self):
        self.course = CourseFactory()
        self.instructor = UserFactory()
        self.meeting = MeetingFactory(course=self.course, instructor=self.instructor)

    def test_meeting_creation(self):
        """Test meeting creation with required fields"""
        self.assertIsInstance(self.meeting, Meeting)
        self.assertEqual(self.meeting.course, self.course)
        self.assertEqual(self.meeting.instructor, self.instructor)
        self.assertTrue(self.meeting.title)

    def test_meeting_str_representation(self):
        """Test string representation of meeting"""
        expected = f"{self.meeting.title} - {self.course.code}"
        self.assertEqual(str(self.meeting), expected)

    def test_meeting_default_values(self):
        """Test default values for meeting"""
        self.assertEqual(self.meeting.duration_minutes, 60)
        self.assertTrue(self.meeting.is_recording_enabled)
        self.assertFalse(self.meeting.is_auto_created)

    def test_meeting_title_required(self):
        """Test that meeting title is required"""
        with self.assertRaises(Exception):
            MeetingFactory(title='')

    def test_meeting_course_required(self):
        """Test that meeting course is required"""
        with self.assertRaises(Exception):
            MeetingFactory(course=None)

    def test_meeting_instructor_required(self):
        """Test that meeting instructor is required"""
        with self.assertRaises(Exception):
            MeetingFactory(instructor=None)


@pytest.mark.django_db
class TestCourseContentModel(TestCase):
    """Test cases for CourseContent model"""

    def setUp(self):
        self.course = CourseFactory()
        self.academic_year = AcademicYearFactory()
        self.semester = SemesterFactory(academic_year=self.academic_year)
        self.content = CourseContentFactory(
            course=self.course,
            academic_year=self.academic_year,
            semester=self.semester
        )

    def test_course_content_creation(self):
        """Test course content creation with required fields"""
        self.assertIsInstance(self.content, CourseContent)
        self.assertEqual(self.content.course, self.course)
        self.assertEqual(self.content.academic_year, self.academic_year)
        self.assertEqual(self.content.semester, self.semester)
        self.assertTrue(self.content.title)

    def test_course_content_str_representation(self):
        """Test string representation of course content"""
        expected = f"{self.content.title} - {self.course.code}"
        self.assertEqual(str(self.content), expected)

    def test_course_content_default_values(self):
        """Test default values for course content"""
        self.assertEqual(self.content.content_type, 'material')
        self.assertTrue(self.content.is_published)

    def test_course_content_type_choices(self):
        """Test course content type choices"""
        valid_choices = ['material', 'recording', 'assignment', 'past_papers']
        for choice in valid_choices:
            content = CourseContentFactory(content_type=choice)
            self.assertEqual(content.content_type, choice)

    def test_course_content_title_required(self):
        """Test that course content title is required"""
        with self.assertRaises(Exception):
            CourseContentFactory(title='')

    def test_course_content_course_required(self):
        """Test that course content course is required"""
        with self.assertRaises(Exception):
            CourseContentFactory(course=None)
