from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from course_api.models import Course, TimetableEntry, CourseMaterial, Recording, Meeting
from datetime import datetime, timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Create demo data for the course organizer'

    def handle(self, *args, **options):
        self.stdout.write('Creating demo data...')

        # Create demo users
        admin_user, created = User.objects.get_or_create(
            email='admin@uon.ac.ke',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'registration_number': 'GPR3/000001/2025',
                'phone_number': '+254 700 000 000',
                'status': 'approved',
                'is_active': True,
                'is_staff': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(f'Created admin user: {admin_user.email}')

        student_user, created = User.objects.get_or_create(
            email='john.doe@student.uon.ac.ke',
            defaults={
                'first_name': 'John',
                'last_name': 'Doe',
                'registration_number': 'GPR3/123456/2025',
                'phone_number': '+254 700 000 001',
                'status': 'approved',
                'is_active': True,
            }
        )
        if created:
            student_user.set_password('student123')
            student_user.save()
            self.stdout.write(f'Created student user: {student_user.email}')

        pending_user, created = User.objects.get_or_create(
            email='jane.smith@student.uon.ac.ke',
            defaults={
                'first_name': 'Jane',
                'last_name': 'Smith',
                'registration_number': 'GPR3/789012/2025',
                'phone_number': '+254 700 000 002',
                'status': 'pending',
                'is_active': False,
            }
        )
        if created:
            pending_user.set_password('student123')
            pending_user.save()
            self.stdout.write(f'Created pending user: {pending_user.email}')

        # Create demo courses
        law_course, created = Course.objects.get_or_create(
            code='LAW101',
            defaults={
                'name': 'Introduction to Law',
                'description': 'Basic principles of law and legal systems'
            }
        )
        if created:
            self.stdout.write(f'Created course: {law_course.name}')

        # Create demo timetable entries
        timetable_data = [
            {'day': 'monday', 'subject': 'Introduction to Law', 'time': '09:00 - 11:00', 'location': 'Room 101'},
            {'day': 'tuesday', 'subject': 'Legal Research Methods', 'time': '14:00 - 16:00', 'location': 'Library'},
            {'day': 'wednesday', 'subject': 'Constitutional Law', 'time': '10:00 - 12:00', 'location': 'Room 102'},
            {'day': 'thursday', 'subject': 'Criminal Law', 'time': '15:00 - 17:00', 'location': 'Room 103'},
            {'day': 'friday', 'subject': 'Legal Writing', 'time': '11:00 - 13:00', 'location': 'Computer Lab'},
        ]

        for entry_data in timetable_data:
            entry, created = TimetableEntry.objects.get_or_create(
                day=entry_data['day'],
                subject=entry_data['subject'],
                defaults={
                    'time': entry_data['time'],
                    'location': entry_data['location'],
                    'course': law_course
                }
            )
            if created:
                self.stdout.write(f'Created timetable entry: {entry.subject}')

        # Create demo materials
        materials_data = [
            {'title': 'Introduction to Law - Chapter 1', 'description': 'Basic legal concepts and terminology', 'file_type': 'PDF'},
            {'title': 'Legal Research Guide', 'description': 'How to conduct effective legal research', 'file_type': 'PDF'},
            {'title': 'Constitutional Law Cases', 'description': 'Important constitutional law cases', 'file_type': 'DOC'},
        ]

        for material_data in materials_data:
            material, created = CourseMaterial.objects.get_or_create(
                title=material_data['title'],
                defaults={
                    'description': material_data['description'],
                    'file_type': material_data['file_type'],
                    'file_url': f'https://example.com/files/{material_data["title"].lower().replace(" ", "_")}.pdf',
                    'course': law_course,
                    'uploaded_by': admin_user
                }
            )
            if created:
                self.stdout.write(f'Created material: {material.title}')

        # Create demo recordings
        recordings_data = [
            {'title': 'Introduction to Law - Lecture 1', 'description': 'Overview of legal systems', 'duration': timedelta(hours=1, minutes=30)},
            {'title': 'Legal Research Methods - Workshop', 'description': 'Practical legal research techniques', 'duration': timedelta(hours=2)},
        ]

        for recording_data in recordings_data:
            recording, created = Recording.objects.get_or_create(
                title=recording_data['title'],
                defaults={
                    'description': recording_data['description'],
                    'duration': recording_data['duration'],
                    'video_url': f'https://example.com/videos/{recording_data["title"].lower().replace(" ", "_")}.mp4',
                    'course': law_course,
                    'uploaded_by': admin_user
                }
            )
            if created:
                self.stdout.write(f'Created recording: {recording.title}')

        # Create demo meetings
        meetings_data = [
            {'title': 'Weekly Discussion - Constitutional Law', 'description': 'Discussion on recent constitutional developments', 'scheduled_time': datetime.now() + timedelta(days=1, hours=14)},
            {'title': 'Legal Writing Workshop', 'description': 'Improving legal writing skills', 'scheduled_time': datetime.now() + timedelta(days=3, hours=10)},
        ]

        for meeting_data in meetings_data:
            meeting, created = Meeting.objects.get_or_create(
                title=meeting_data['title'],
                defaults={
                    'description': meeting_data['description'],
                    'scheduled_time': meeting_data['scheduled_time'],
                    'duration': timedelta(hours=1),
                    'meeting_url': f'https://meet.example.com/{meeting_data["title"].lower().replace(" ", "-")}',
                    'course': law_course,
                    'created_by': admin_user
                }
            )
            if created:
                self.stdout.write(f'Created meeting: {meeting.title}')

        self.stdout.write(
            self.style.SUCCESS('Successfully created demo data!')
        )