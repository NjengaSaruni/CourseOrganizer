from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from directory.models import AcademicYear
from school.models import Class
from communication.models import ClassRepRole, Message, Announcement, Poll

User = get_user_model()


class CommunicationModelsTestCase(TestCase):
    """Test cases for communication models"""
    
    def setUp(self):
        """Set up test data"""
        # Create academic year
        self.academic_year = AcademicYear.objects.create(
            year_start=2025,
            year_end=2026,
            is_active=True,
            first_semester_start='2025-09-01',
            first_semester_end='2025-12-13',
            second_semester_start='2026-01-15',
            second_semester_end='2026-04-30',
        )
        
        # Create class
        self.student_class = Class.objects.create(
            name='Class of 2029',
            program='GPR',
            graduation_year=2029,
            academic_year=self.academic_year,
        )
        
        # Create users
        self.admin = User.objects.create_user(
            email='admin@example.com',
            registration_number='ADM/001/2025',
            phone_number='+254700000000',
            user_type='admin',
            first_name='Admin',
            last_name='User',
        )
        
        self.student1 = User.objects.create_user(
            email='student1@example.com',
            registration_number='GPR3/123456/2025',
            phone_number='+254700000001',
            user_type='student',
            student_class=self.student_class,
            first_name='John',
            last_name='Doe',
        )
        
        self.student2 = User.objects.create_user(
            email='student2@example.com',
            registration_number='GPR3/123457/2025',
            phone_number='+254700000002',
            user_type='student',
            student_class=self.student_class,
            first_name='Jane',
            last_name='Smith',
        )
    
    def test_class_rep_role_creation(self):
        """Test creating a Class Rep role"""
        class_rep = ClassRepRole.objects.create(
            user=self.student1,
            student_class=self.student_class,
            permissions=['send_announcements', 'manage_polls'],
            assigned_by=self.admin,
        )
        
        self.assertEqual(class_rep.user, self.student1)
        self.assertEqual(class_rep.student_class, self.student_class)
        self.assertIn('send_announcements', class_rep.permissions)
        self.assertTrue(class_rep.is_active)
    
    def test_class_rep_permissions(self):
        """Test Class Rep permission checking"""
        class_rep = ClassRepRole.objects.create(
            user=self.student1,
            student_class=self.student_class,
            permissions=['send_announcements', 'manage_polls'],
            assigned_by=self.admin,
        )
        
        self.assertTrue(class_rep.has_permission('send_announcements'))
        self.assertTrue(class_rep.has_permission('manage_polls'))
        self.assertFalse(class_rep.has_permission('moderate_messages'))
    
    def test_user_class_rep_properties(self):
        """Test User model Class Rep properties"""
        # Initially not a Class Rep
        self.assertFalse(self.student1.is_class_rep)
        self.assertFalse(self.student1.has_class_rep_permission('send_announcements'))
        
        # Assign as Class Rep
        ClassRepRole.objects.create(
            user=self.student1,
            student_class=self.student_class,
            permissions=['send_announcements'],
            assigned_by=self.admin,
        )
        
        # Refresh from database
        self.student1.refresh_from_db()
        
        self.assertTrue(self.student1.is_class_rep)
        self.assertTrue(self.student1.has_class_rep_permission('send_announcements'))
    
    def test_message_creation(self):
        """Test message creation"""
        # Regular message
        message = Message.objects.create(
            sender=self.student1,
            student_class=self.student_class,
            content='Hello everyone!',
            is_private=False,
        )
        
        self.assertEqual(message.sender, self.student1)
        self.assertEqual(message.content, 'Hello everyone!')
        self.assertFalse(message.is_private)
        self.assertFalse(message.is_announcement)
    
    def test_private_message_validation(self):
        """Test private message validation"""
        # Valid private message
        message = Message.objects.create(
            sender=self.student1,
            recipient=self.student2,
            student_class=self.student_class,
            content='Private message',
            is_private=True,
        )
        
        self.assertTrue(message.is_private)
        self.assertEqual(message.recipient, self.student2)
    
    def test_announcement_creation_by_class_rep(self):
        """Test announcement creation by Class Rep"""
        # Make student1 a Class Rep
        ClassRepRole.objects.create(
            user=self.student1,
            student_class=self.student_class,
            permissions=['send_announcements'],
            assigned_by=self.admin,
        )
        
        # Create announcement
        announcement = Announcement.objects.create(
            sender=self.student1,
            student_class=self.student_class,
            title='Important Notice',
            content='This is an important announcement',
            priority='high',
        )
        
        self.assertEqual(announcement.sender, self.student1)
        self.assertEqual(announcement.title, 'Important Notice')
        self.assertEqual(announcement.priority, 'high')
    
    def test_announcement_creation_by_non_class_rep(self):
        """Test that non-Class Reps cannot create announcements"""
        # Try to create announcement without Class Rep role
        with self.assertRaises(ValidationError):
            announcement = Announcement(
                sender=self.student2,  # Not a Class Rep
                student_class=self.student_class,
                title='Unauthorized Announcement',
                content='This should fail',
            )
            announcement.full_clean()
    
    def test_poll_creation_by_class_rep(self):
        """Test poll creation by Class Rep"""
        # Make student1 a Class Rep
        ClassRepRole.objects.create(
            user=self.student1,
            student_class=self.student_class,
            permissions=['manage_polls'],
            assigned_by=self.admin,
        )
        
        # Create poll
        poll = Poll.objects.create(
            creator=self.student1,
            student_class=self.student_class,
            title='Class Meeting Time',
            description='When should we have our class meeting?',
            options=['Monday 2PM', 'Tuesday 3PM', 'Wednesday 4PM'],
            status='active',
        )
        
        self.assertEqual(poll.creator, self.student1)
        self.assertEqual(poll.title, 'Class Meeting Time')
        self.assertEqual(len(poll.options), 3)
        self.assertEqual(poll.status, 'active')
    
    def test_poll_creation_by_non_class_rep(self):
        """Test that non-Class Reps cannot create polls"""
        # Try to create poll without Class Rep role
        with self.assertRaises(ValidationError):
            poll = Poll(
                creator=self.student2,  # Not a Class Rep
                student_class=self.student_class,
                title='Unauthorized Poll',
                options=['Option 1', 'Option 2'],
            )
            poll.full_clean()
    
    def test_class_rep_role_validation(self):
        """Test Class Rep role validation"""
        # Try to assign non-student as Class Rep
        with self.assertRaises(ValidationError):
            class_rep = ClassRepRole(
                user=self.admin,  # Admin, not student
                student_class=self.student_class,
                permissions=['send_announcements'],
            )
            class_rep.full_clean()
        
        # Try to assign student from different class
        other_class = Class.objects.create(
            name='Class of 2030',
            program='GPR',
            graduation_year=2030,
            academic_year=self.academic_year,
        )
        
        other_student = User.objects.create_user(
            email='other@example.com',
            registration_number='GPR3/999999/2025',
            phone_number='+254700000999',
            user_type='student',
            student_class=other_class,
            first_name='Other',
            last_name='Student',
        )
        
        with self.assertRaises(ValidationError):
            class_rep = ClassRepRole(
                user=other_student,
                student_class=self.student_class,  # Different class
                permissions=['send_announcements'],
            )
            class_rep.full_clean()