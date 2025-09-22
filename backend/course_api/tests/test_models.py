import pytest
from django.test import TestCase
from django.core.exceptions import ValidationError
from factory import Faker, SubFactory, LazyAttribute
from factory.django import DjangoModelFactory
from course_api.models import Course, Meeting, CourseContent
from directory.tests.test_models import UserFactory, AcademicYearFactory


class CourseFactory(DjangoModelFactory):
    class Meta:
        model = Course

    name = Faker('sentence', nb_words=3)
    code = Faker('bothify', text='GPR####')
    description = Faker('text', max_nb_chars=200)
    year = 1
    semester = 1
    academic_year = SubFactory(AcademicYearFactory)
    credits = 3


class MeetingFactory(DjangoModelFactory):
    class Meta:
        model = Meeting

    title = Faker('sentence', nb_words=4)
    description = Faker('text', max_nb_chars=300)
    course = SubFactory(CourseFactory)
    created_by = SubFactory(UserFactory)
    scheduled_time = Faker('future_datetime', end_date='+30d')
    duration = None
    is_recording_enabled = True
    is_auto_created = False


class CourseContentFactory(DjangoModelFactory):
    class Meta:
        model = CourseContent

    title = Faker('sentence', nb_words=4)
    description = Faker('text', max_nb_chars=200)
    course = SubFactory(CourseFactory)
    uploaded_by = SubFactory(UserFactory)
    content_type = 'material'
    lesson_date = Faker('date_object')
    lesson_order = 1
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
        text = str(self.course)
        self.assertIn(self.course.code, text)
        self.assertIn(self.course.name, text)

    def test_course_code_unique(self):
        """Test that course code must be unique"""
        with self.assertRaises(Exception):
            CourseFactory(code=self.course.code)

    def test_course_default_values(self):
        """Test default values for course"""
        self.assertEqual(self.course.credits, 3)

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
        self.creator = UserFactory()
        self.meeting = MeetingFactory(course=self.course, created_by=self.creator)

    def test_meeting_creation(self):
        """Test meeting creation with required fields"""
        self.assertIsInstance(self.meeting, Meeting)
        self.assertEqual(self.meeting.course, self.course)
        self.assertEqual(self.meeting.created_by, self.creator)
        self.assertTrue(self.meeting.title)

    def test_meeting_str_representation(self):
        """Test string representation of meeting"""
        text = str(self.meeting)
        self.assertIn(self.meeting.title, text)

    def test_meeting_default_values(self):
        """Test default values for meeting"""
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

    def test_meeting_creator_required(self):
        """Test that meeting creator is required"""
        with self.assertRaises(Exception):
            MeetingFactory(created_by=None)


@pytest.mark.django_db
class TestCourseContentModel(TestCase):
    """Test cases for CourseContent model"""

    def setUp(self):
        self.course = CourseFactory()
        self.uploader = UserFactory()
        self.content = CourseContentFactory(
            course=self.course,
            uploaded_by=self.uploader,
        )

    def test_course_content_creation(self):
        """Test course content creation with required fields"""
        self.assertIsInstance(self.content, CourseContent)
        self.assertEqual(self.content.course, self.course)
        self.assertTrue(self.content.title)

    def test_course_content_str_representation(self):
        """Test string representation of course content"""
        text = str(self.content)
        self.assertIn(self.content.title, text)

    def test_course_content_default_values(self):
        """Test default values for course content"""
        self.assertEqual(self.content.content_type, 'material')
        self.assertTrue(self.content.is_published)

    def test_course_content_type_choices(self):
        """Test course content type choices"""
        valid_choices = ['material', 'recording', 'assignment', 'announcement']
        for choice in valid_choices:
            content = CourseContentFactory(
                course=self.course,
                uploaded_by=self.uploader,
                content_type=choice,
            )
            self.assertEqual(content.content_type, choice)

    def test_course_content_title_required(self):
        """Test that course content title is required"""
        with self.assertRaises(Exception):
            CourseContentFactory(title='')

    def test_course_content_course_required(self):
        """Test that course content course is required"""
        with self.assertRaises(Exception):
            CourseContentFactory(course=None)
