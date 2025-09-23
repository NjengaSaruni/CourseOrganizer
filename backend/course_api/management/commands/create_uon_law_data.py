from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
import os
from course_api.models import Course, TimetableEntry, CourseMaterial, Recording, Meeting
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'Create University of Nairobi School of Law Module II data - First Year First Semester only (GPR31xx courses)'

    def handle(self, *args, **options):
        # Safety guard: prevent accidental execution in production without explicit override
        allow_destructive = os.environ.get('ALLOW_DESTRUCTIVE_CMDS', 'false').lower() in ['1', 'true', 'yes']
        if not settings.DEBUG and not allow_destructive:
            self.stdout.write(self.style.ERROR('This command is disabled in production. Set ALLOW_DESTRUCTIVE_CMDS=true to override.'))
            return
        self.stdout.write('Creating UoN Law Module II data...')

        # Create demo student (read-only privileges for Class of 2029)
        # Get the 2025/2026 academic year
        from course_api.models import AcademicYear
        academic_year = AcademicYear.get_or_create_2025_2026()
        
        demo_student, created = User.objects.get_or_create(
            email='demo.student@uon.ac.ke',
            defaults={
                'first_name': 'Demo',
                'last_name': 'Student',
                'registration_number': 'GPR3/999999/2025',
                'phone_number': '+254700000999',
                'status': 'approved',
                'is_active': True,
                'current_year': 1,
                'current_semester': 1,
                'class_of': 2029,
                'academic_year': academic_year,
                'user_type': 'student',
            }
        )
        # Always ensure password is set/updated from env or default
        demo_password = os.environ.get('DEMO_STUDENT_PASSWORD', 'demo123')
        demo_student.set_password(demo_password)
        demo_student.save()
        action_msg = 'Created' if created else 'Updated'
        self.stdout.write(f'{action_msg} demo student: {demo_student.email}')
        
        # Get or create admin user for content creation (but don't set password)
        admin_user, created = User.objects.get_or_create(
            email='admin@uon.ac.ke',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'registration_number': 'GPR3/000001/2025',
                'phone_number': '+254700000000',
                'status': 'approved',
                'is_active': True,
                'is_staff': True,
                'is_superuser': True,
                'user_type': 'admin',
                'academic_year': academic_year,
            }
        )
        if created:
            # Don't set password - admin must use setup_admin command
            self.stdout.write(f'Created admin user (no password set): {admin_user.email}')
            self.stdout.write('Run: python manage.py setup_admin to set admin password')

        student_user, created = User.objects.get_or_create(
            email='john.doe@student.uon.ac.ke',
            defaults={
                'first_name': 'John',
                'last_name': 'Doe',
                'registration_number': 'GPR3/123456/2025',
                'phone_number': '+254700000001',
                'status': 'approved',
                'is_active': True,
                'current_year': 1,
                'current_semester': 1,
                'class_of': 2029,
                'academic_year': academic_year,
            }
        )
        if created:
            student_user.set_password('student123')
            student_user.save()
            self.stdout.write(f'Created student user: {student_user.email}')


        # Clear existing data
        Course.objects.all().delete()
        TimetableEntry.objects.all().delete()
        CourseMaterial.objects.all().delete()
        Recording.objects.all().delete()
        Meeting.objects.all().delete()

        # Create only First Year First Semester courses (GPR31xx) for Class of 2025-2029
        courses_data = [
            # First Year Courses (GPR31xx) - First Semester
            {'code': 'GPR3101', 'name': 'TORTS I', 'description': 'Introduction to tort law and civil wrongs', 'year': 1, 'semester': 1, 'credits': 3, 'is_core': True},
            {'code': 'GPR3103', 'name': 'CONTRACTS I', 'description': 'Fundamentals of contract law', 'year': 1, 'semester': 1, 'credits': 3, 'is_core': True},
            {'code': 'GPR3105', 'name': 'CRIMINAL LAW I', 'description': 'Introduction to criminal law principles', 'year': 1, 'semester': 1, 'credits': 3, 'is_core': True},
            {'code': 'GPR3107', 'name': 'CONSTITUTIONAL LAW I', 'description': 'Constitutional principles and governance', 'year': 1, 'semester': 1, 'credits': 3, 'is_core': True},
            {'code': 'GPR3109', 'name': 'LEGAL SYSTEMS AND LEGAL METHODS', 'description': 'Legal systems and research methods', 'year': 1, 'semester': 1, 'credits': 3, 'is_core': True},
            {'code': 'GPR3115', 'name': 'COMMUNICATION SKILLS FOR LAWYERS', 'description': 'Professional communication skills', 'year': 1, 'semester': 1, 'credits': 2, 'is_core': True},
            {'code': 'GPR3117', 'name': 'LEGAL RESEARCH AND WRITING', 'description': 'Legal research and writing techniques', 'year': 1, 'semester': 1, 'credits': 3, 'is_core': True},
        ]

        courses = {}
        for course_data in courses_data:
            course, created = Course.objects.get_or_create(
                code=course_data['code'],
                academic_year=academic_year,
                defaults={
                    'name': course_data['name'],
                    'description': course_data['description'],
                    'year': course_data['year'],
                    'semester': course_data['semester'],
                    'credits': course_data['credits'],
                    'is_core': course_data['is_core']
                }
            )
            courses[course_data['code']] = course
            if created:
                self.stdout.write(f'Created course: {course.name} (Year {course.year}, Sem {course.semester})')

        # Create timetable entries for First Year First Semester courses only
        timetable_data = [
            # Monday
            {'day': 'monday', 'code': 'GPR3107', 'subject': 'CONSTITUTIONAL LAW I', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'S. Alosa'},
            
            # Tuesday
            {'day': 'tuesday', 'code': 'GPR3103', 'subject': 'CONTRACTS I', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'J.Murungi/ M. Okelloh'},
            
            # Wednesday
            {'day': 'wednesday', 'code': 'GPR3109', 'subject': 'LEGAL SYSTEMS AND LEGAL METHODS', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'S. Ouma'},
            
            # Thursday
            {'day': 'thursday', 'code': 'GPR3101', 'subject': 'TORTS I', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'V. Yatani/P. Pete'},
            
            # Friday
            {'day': 'friday', 'code': 'GPR3115', 'subject': 'COMMUNICATION SKILLS FOR LAWYERS', 'time': '08:00 - 11:00', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'N. Maru/M. Okelloh'},
            {'day': 'friday', 'code': 'GPR3117', 'subject': 'LEGAL RESEARCH AND WRITING', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'S. Kinyanjui'},
            
            # Saturday
            {'day': 'saturday', 'code': 'GPR3105', 'subject': 'CRIMINAL LAW I', 'time': '11:00 - 14:00', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'N. Sitonic/ C. Shilaho'},
        ]

        for entry_data in timetable_data:
            course = courses.get(entry_data['code'])
            if course:
                entry, created = TimetableEntry.objects.get_or_create(
                    day=entry_data['day'],
                    subject=entry_data['subject'],
                    defaults={
                        'time': entry_data['time'],
                        'location': entry_data['location'],
                        'course': course,
                        'group': entry_data['group'],
                        'lecturer': entry_data['lecturer']
                    }
                )
                if created:
                    self.stdout.write(f'Created timetable entry: {entry.subject}')

        # Note: Dummy content (materials, recordings, meetings) removed to allow for real content upload
        self.stdout.write('Dummy content creation skipped - ready for real content upload')

        self.stdout.write(
            self.style.SUCCESS('Successfully created UoN Law Module II data for First Year First Semester (GPR31xx courses)!')
        )