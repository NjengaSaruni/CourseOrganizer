from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
import os
from course_api.models import Course, TimetableEntry, CourseMaterial, Recording, Meeting, AcademicYear
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'Create demo data for the course organizer'

    def handle(self, *args, **options):
        # Safety guard: prevent accidental execution in production without explicit override
        allow_destructive = os.environ.get('ALLOW_DESTRUCTIVE_CMDS', 'false').lower() in ['1', 'true', 'yes']
        if not settings.DEBUG and not allow_destructive:
            self.stdout.write(self.style.ERROR('This command is disabled in production. Set ALLOW_DESTRUCTIVE_CMDS=true to override.'))
            return

        self.stdout.write('Creating demo data...')

        # Get or create the 2025/2026 academic year
        academic_year = AcademicYear.get_or_create_2025_2026()

        # Create demo student (read-only privileges for Class of 2029)
        demo_student, created = User.objects.get_or_create(
            email='demo.student@uon.ac.ke',
            defaults={
                'first_name': 'Demo',
                'last_name': 'Student',
                'registration_number': 'GPR3/999999/2025',
                'phone_number': '+254 700 000 999',
                'status': 'approved',
                'is_active': True,
                'current_year': 1,
                'current_semester': 1,
                'class_of': 2029,
                'academic_year': academic_year,
                'user_type': 'student',
            }
        )
        if created:
            demo_student.set_password('demo123')
            demo_student.save()
            self.stdout.write(f'Created demo student: {demo_student.email}')
        
        # Get or create admin user for content creation (but don't set password)
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
                'phone_number': '+254 700 000 001',
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


        # Create comprehensive demo courses for First Year First Semester
        demo_courses_data = [
            {
                'code': 'GPR3101',
                'name': 'TORTS I',
                'description': 'Introduction to tort law and civil wrongs',
                'year': 1,
                'semester': 1,
                'credits': 3,
                'is_core': True
            },
            {
                'code': 'GPR3103',
                'name': 'CONTRACTS I',
                'description': 'Fundamentals of contract law',
                'year': 1,
                'semester': 1,
                'credits': 3,
                'is_core': True
            },
            {
                'code': 'GPR3105',
                'name': 'CRIMINAL LAW I',
                'description': 'Introduction to criminal law principles',
                'year': 1,
                'semester': 1,
                'credits': 3,
                'is_core': True
            },
            {
                'code': 'GPR3107',
                'name': 'CONSTITUTIONAL LAW I',
                'description': 'Constitutional law and governance',
                'year': 1,
                'semester': 1,
                'credits': 3,
                'is_core': True
            },
            {
                'code': 'GPR3109',
                'name': 'LEGAL SYSTEMS AND LEGAL METHODS',
                'description': 'Legal systems and research methods',
                'year': 1,
                'semester': 1,
                'credits': 3,
                'is_core': True
            },
            {
                'code': 'GPR3115',
                'name': 'COMMUNICATION SKILLS FOR LAWYERS',
                'description': 'Professional communication skills',
                'year': 1,
                'semester': 1,
                'credits': 2,
                'is_core': True
            },
            {
                'code': 'GPR3117',
                'name': 'LEGAL RESEARCH AND WRITING',
                'description': 'Legal research and writing techniques',
                'year': 1,
                'semester': 1,
                'credits': 2,
                'is_core': True
            }
        ]

        demo_courses = {}
        for course_data in demo_courses_data:
            course, created = Course.objects.get_or_create(
                code=course_data['code'],
                academic_year=academic_year,
                defaults=course_data
            )
            demo_courses[course_data['code']] = course
            if created:
                self.stdout.write(f'Created course: {course.name}')

        # Create comprehensive timetable entries for all courses
        timetable_data = [
            # Monday
            {'day': 'monday', 'subject': 'TORTS I', 'time': '08:00 - 10:00', 'location': 'Room 101', 'course_code': 'GPR3101', 'group': 'Group A', 'lecturer': 'Prof. Jane Smith'},
            {'day': 'monday', 'subject': 'CONTRACTS I', 'time': '10:00 - 12:00', 'location': 'Room 102', 'course_code': 'GPR3103', 'group': 'Group A', 'lecturer': 'Dr. John Doe'},
            {'day': 'monday', 'subject': 'LEGAL SYSTEMS AND LEGAL METHODS', 'time': '14:00 - 16:00', 'location': 'Library', 'course_code': 'GPR3109', 'group': 'Group A', 'lecturer': 'Prof. Mary Johnson'},
            
            # Tuesday
            {'day': 'tuesday', 'subject': 'CRIMINAL LAW I', 'time': '08:00 - 10:00', 'location': 'Room 103', 'course_code': 'GPR3105', 'group': 'Group A', 'lecturer': 'Dr. Robert Brown'},
            {'day': 'tuesday', 'subject': 'CONSTITUTIONAL LAW I', 'time': '10:00 - 12:00', 'location': 'Room 104', 'course_code': 'GPR3107', 'group': 'Group A', 'lecturer': 'Prof. Sarah Wilson'},
            {'day': 'tuesday', 'subject': 'COMMUNICATION SKILLS FOR LAWYERS', 'time': '14:00 - 16:00', 'location': 'Computer Lab', 'course_code': 'GPR3115', 'group': 'Group A', 'lecturer': 'Ms. Lisa Davis'},
            
            # Wednesday
            {'day': 'wednesday', 'subject': 'TORTS I', 'time': '08:00 - 10:00', 'location': 'Room 101', 'course_code': 'GPR3101', 'group': 'Group A', 'lecturer': 'Prof. Jane Smith'},
            {'day': 'wednesday', 'subject': 'LEGAL RESEARCH AND WRITING', 'time': '10:00 - 12:00', 'location': 'Library', 'course_code': 'GPR3117', 'group': 'Group A', 'lecturer': 'Dr. Michael Taylor'},
            {'day': 'wednesday', 'subject': 'CONTRACTS I', 'time': '14:00 - 16:00', 'location': 'Room 102', 'course_code': 'GPR3103', 'group': 'Group A', 'lecturer': 'Dr. John Doe'},
            
            # Thursday
            {'day': 'thursday', 'subject': 'CRIMINAL LAW I', 'time': '08:00 - 10:00', 'location': 'Room 103', 'course_code': 'GPR3105', 'group': 'Group A', 'lecturer': 'Dr. Robert Brown'},
            {'day': 'thursday', 'subject': 'CONSTITUTIONAL LAW I', 'time': '10:00 - 12:00', 'location': 'Room 104', 'course_code': 'GPR3107', 'group': 'Group A', 'lecturer': 'Prof. Sarah Wilson'},
            {'day': 'thursday', 'subject': 'LEGAL SYSTEMS AND LEGAL METHODS', 'time': '14:00 - 16:00', 'location': 'Library', 'course_code': 'GPR3109', 'group': 'Group A', 'lecturer': 'Prof. Mary Johnson'},
            
            # Friday
            {'day': 'friday', 'subject': 'LEGAL RESEARCH AND WRITING', 'time': '08:00 - 10:00', 'location': 'Computer Lab', 'course_code': 'GPR3117', 'group': 'Group A', 'lecturer': 'Dr. Michael Taylor'},
            {'day': 'friday', 'subject': 'COMMUNICATION SKILLS FOR LAWYERS', 'time': '10:00 - 12:00', 'location': 'Room 105', 'course_code': 'GPR3115', 'group': 'Group A', 'lecturer': 'Ms. Lisa Davis'},
        ]

        for entry_data in timetable_data:
            course = demo_courses.get(entry_data['course_code'])
            if course:
                entry, created = TimetableEntry.objects.get_or_create(
                    day=entry_data['day'],
                    subject=entry_data['subject'],
                    course=course,
                    defaults={
                        'time': entry_data['time'],
                        'location': entry_data['location'],
                        'group': entry_data['group'],
                        'lecturer': entry_data['lecturer']
                    }
                )
                if created:
                    self.stdout.write(f'Created timetable entry: {entry.subject}')

        # Create comprehensive demo materials for all courses
        materials_data = [
            # TORTS I
            {'title': 'TORTS I - Course Outline', 'description': 'Complete course outline and assessment criteria', 'file_type': 'PDF', 'course_code': 'GPR3101'},
            {'title': 'TORTS I - Reading List', 'description': 'Required and recommended readings for Torts I', 'file_type': 'PDF', 'course_code': 'GPR3101'},
            {'title': 'TORTS I - Lecture Notes 1', 'description': 'Introduction to tort law and negligence', 'file_type': 'PDF', 'course_code': 'GPR3101'},
            {'title': 'TORTS I - Case Studies', 'description': 'Important tort law cases and analysis', 'file_type': 'DOC', 'course_code': 'GPR3101'},
            
            # CONTRACTS I
            {'title': 'CONTRACTS I - Course Outline', 'description': 'Complete course outline and assessment criteria', 'file_type': 'PDF', 'course_code': 'GPR3103'},
            {'title': 'CONTRACTS I - Reading List', 'description': 'Required and recommended readings for Contracts I', 'file_type': 'PDF', 'course_code': 'GPR3103'},
            {'title': 'CONTRACTS I - Lecture Notes 1', 'description': 'Introduction to contract formation', 'file_type': 'PDF', 'course_code': 'GPR3103'},
            
            # CRIMINAL LAW I
            {'title': 'CRIMINAL LAW I - Course Outline', 'description': 'Complete course outline and assessment criteria', 'file_type': 'PDF', 'course_code': 'GPR3105'},
            {'title': 'CRIMINAL LAW I - Reading List', 'description': 'Required and recommended readings for Criminal Law I', 'file_type': 'PDF', 'course_code': 'GPR3105'},
            {'title': 'CRIMINAL LAW I - Lecture Notes 1', 'description': 'Introduction to criminal law principles', 'file_type': 'PDF', 'course_code': 'GPR3105'},
            
            # CONSTITUTIONAL LAW I
            {'title': 'CONSTITUTIONAL LAW I - Course Outline', 'description': 'Complete course outline and assessment criteria', 'file_type': 'PDF', 'course_code': 'GPR3107'},
            {'title': 'CONSTITUTIONAL LAW I - Reading List', 'description': 'Required and recommended readings for Constitutional Law I', 'file_type': 'PDF', 'course_code': 'GPR3107'},
            {'title': 'CONSTITUTIONAL LAW I - Lecture Notes 1', 'description': 'Introduction to constitutional law', 'file_type': 'PDF', 'course_code': 'GPR3107'},
            
            # LEGAL SYSTEMS AND LEGAL METHODS
            {'title': 'LEGAL SYSTEMS AND LEGAL METHODS - Course Outline', 'description': 'Complete course outline and assessment criteria', 'file_type': 'PDF', 'course_code': 'GPR3109'},
            {'title': 'LEGAL SYSTEMS AND LEGAL METHODS - Reading List', 'description': 'Required and recommended readings', 'file_type': 'PDF', 'course_code': 'GPR3109'},
            {'title': 'LEGAL SYSTEMS AND LEGAL METHODS - Lecture Notes 1', 'description': 'Introduction to legal systems', 'file_type': 'PDF', 'course_code': 'GPR3109'},
            
            # COMMUNICATION SKILLS FOR LAWYERS
            {'title': 'COMMUNICATION SKILLS FOR LAWYERS - Course Outline', 'description': 'Complete course outline and assessment criteria', 'file_type': 'PDF', 'course_code': 'GPR3115'},
            {'title': 'COMMUNICATION SKILLS FOR LAWYERS - Reading List', 'description': 'Required and recommended readings', 'file_type': 'PDF', 'course_code': 'GPR3115'},
            
            # LEGAL RESEARCH AND WRITING
            {'title': 'LEGAL RESEARCH AND WRITING - Course Outline', 'description': 'Complete course outline and assessment criteria', 'file_type': 'PDF', 'course_code': 'GPR3117'},
            {'title': 'LEGAL RESEARCH AND WRITING - Reading List', 'description': 'Required and recommended readings', 'file_type': 'PDF', 'course_code': 'GPR3117'},
            {'title': 'LEGAL RESEARCH AND WRITING - Lecture Notes 1', 'description': 'Introduction to legal research methods', 'file_type': 'PDF', 'course_code': 'GPR3117'},
        ]

        for material_data in materials_data:
            course = demo_courses.get(material_data['course_code'])
            if course:
                material, created = CourseMaterial.objects.get_or_create(
                    title=material_data['title'],
                    course=course,
                    defaults={
                        'description': material_data['description'],
                        'file_type': material_data['file_type'],
                        'file_url': f'https://example.com/files/{material_data["title"].lower().replace(" ", "_")}.pdf',
                        'uploaded_by': admin_user
                    }
                )
                if created:
                    self.stdout.write(f'Created material: {material.title}')

        # Create comprehensive demo recordings for all courses
        recordings_data = [
            # TORTS I
            {'title': 'TORTS I - Lecture 1: Introduction', 'description': 'Introduction to tort law and negligence', 'duration': timedelta(hours=1, minutes=30), 'course_code': 'GPR3101'},
            {'title': 'TORTS I - Lecture 2: Basic Concepts', 'description': 'Basic concepts of tort law', 'duration': timedelta(hours=1, minutes=45), 'course_code': 'GPR3101'},
            
            # CONTRACTS I
            {'title': 'CONTRACTS I - Lecture 1: Introduction', 'description': 'Introduction to contract formation', 'duration': timedelta(hours=1, minutes=30), 'course_code': 'GPR3103'},
            {'title': 'CONTRACTS I - Lecture 2: Basic Concepts', 'description': 'Basic concepts of contract law', 'duration': timedelta(hours=1, minutes=45), 'course_code': 'GPR3103'},
            
            # CRIMINAL LAW I
            {'title': 'CRIMINAL LAW I - Lecture 1: Introduction', 'description': 'Introduction to criminal law principles', 'duration': timedelta(hours=1, minutes=30), 'course_code': 'GPR3105'},
            {'title': 'CRIMINAL LAW I - Lecture 2: Basic Concepts', 'description': 'Basic concepts of criminal law', 'duration': timedelta(hours=1, minutes=45), 'course_code': 'GPR3105'},
            
            # CONSTITUTIONAL LAW I
            {'title': 'CONSTITUTIONAL LAW I - Lecture 1: Introduction', 'description': 'Introduction to constitutional law', 'duration': timedelta(hours=1, minutes=30), 'course_code': 'GPR3107'},
            {'title': 'CONSTITUTIONAL LAW I - Lecture 2: Basic Concepts', 'description': 'Basic concepts of constitutional law', 'duration': timedelta(hours=1, minutes=45), 'course_code': 'GPR3107'},
            
            # LEGAL SYSTEMS AND LEGAL METHODS
            {'title': 'LEGAL SYSTEMS AND LEGAL METHODS - Lecture 1: Introduction', 'description': 'Introduction to legal systems', 'duration': timedelta(hours=1, minutes=30), 'course_code': 'GPR3109'},
            {'title': 'LEGAL SYSTEMS AND LEGAL METHODS - Lecture 2: Basic Concepts', 'description': 'Basic concepts of legal methods', 'duration': timedelta(hours=1, minutes=45), 'course_code': 'GPR3109'},
            
            # COMMUNICATION SKILLS FOR LAWYERS
            {'title': 'COMMUNICATION SKILLS FOR LAWYERS - Lecture 1: Introduction', 'description': 'Introduction to professional communication', 'duration': timedelta(hours=1, minutes=30), 'course_code': 'GPR3115'},
            {'title': 'COMMUNICATION SKILLS FOR LAWYERS - Lecture 2: Basic Concepts', 'description': 'Basic concepts of legal communication', 'duration': timedelta(hours=1, minutes=45), 'course_code': 'GPR3115'},
            
            # LEGAL RESEARCH AND WRITING
            {'title': 'LEGAL RESEARCH AND WRITING - Lecture 1: Introduction', 'description': 'Introduction to legal research methods', 'duration': timedelta(hours=1, minutes=30), 'course_code': 'GPR3117'},
            {'title': 'LEGAL RESEARCH AND WRITING - Lecture 2: Basic Concepts', 'description': 'Basic concepts of legal writing', 'duration': timedelta(hours=1, minutes=45), 'course_code': 'GPR3117'},
        ]

        for recording_data in recordings_data:
            course = demo_courses.get(recording_data['course_code'])
            if course:
                recording, created = Recording.objects.get_or_create(
                    title=recording_data['title'],
                    course=course,
                    defaults={
                        'description': recording_data['description'],
                        'duration': recording_data['duration'],
                        'video_url': f'https://example.com/videos/{recording_data["title"].lower().replace(" ", "_")}.mp4',
                        'uploaded_by': admin_user
                    }
                )
                if created:
                    self.stdout.write(f'Created recording: {recording.title}')

        # Create comprehensive demo meetings for all courses
        meetings_data = [
            # TORTS I
            {'title': 'TORTS I - Weekly Discussion', 'description': 'Weekly discussion session for Torts I', 'scheduled_time': timezone.now() + timedelta(days=1, hours=17, minutes=30), 'course_code': 'GPR3101'},
            {'title': 'TORTS I - Assignment Review', 'description': 'Review of assignments and feedback session for Torts I', 'scheduled_time': timezone.now() + timedelta(days=7, hours=17, minutes=30), 'course_code': 'GPR3101'},
            
            # CONTRACTS I
            {'title': 'CONTRACTS I - Weekly Discussion', 'description': 'Weekly discussion session for Contracts I', 'scheduled_time': timezone.now() + timedelta(days=2, hours=17, minutes=30), 'course_code': 'GPR3103'},
            {'title': 'CONTRACTS I - Assignment Review', 'description': 'Review of assignments and feedback session for Contracts I', 'scheduled_time': timezone.now() + timedelta(days=8, hours=17, minutes=30), 'course_code': 'GPR3103'},
            
            # CRIMINAL LAW I
            {'title': 'CRIMINAL LAW I - Weekly Discussion', 'description': 'Weekly discussion session for Criminal Law I', 'scheduled_time': timezone.now() + timedelta(days=3, hours=17, minutes=30), 'course_code': 'GPR3105'},
            {'title': 'CRIMINAL LAW I - Assignment Review', 'description': 'Review of assignments and feedback session for Criminal Law I', 'scheduled_time': timezone.now() + timedelta(days=9, hours=17, minutes=30), 'course_code': 'GPR3105'},
            
            # CONSTITUTIONAL LAW I
            {'title': 'CONSTITUTIONAL LAW I - Weekly Discussion', 'description': 'Weekly discussion session for Constitutional Law I', 'scheduled_time': timezone.now() + timedelta(days=4, hours=17, minutes=30), 'course_code': 'GPR3107'},
            {'title': 'CONSTITUTIONAL LAW I - Assignment Review', 'description': 'Review of assignments and feedback session for Constitutional Law I', 'scheduled_time': timezone.now() + timedelta(days=10, hours=17, minutes=30), 'course_code': 'GPR3107'},
            
            # LEGAL SYSTEMS AND LEGAL METHODS
            {'title': 'LEGAL SYSTEMS AND LEGAL METHODS - Weekly Discussion', 'description': 'Weekly discussion session for Legal Systems and Legal Methods', 'scheduled_time': timezone.now() + timedelta(days=5, hours=17, minutes=30), 'course_code': 'GPR3109'},
            {'title': 'LEGAL SYSTEMS AND LEGAL METHODS - Assignment Review', 'description': 'Review of assignments and feedback session for Legal Systems and Legal Methods', 'scheduled_time': timezone.now() + timedelta(days=11, hours=17, minutes=30), 'course_code': 'GPR3109'},
            
            # COMMUNICATION SKILLS FOR LAWYERS
            {'title': 'COMMUNICATION SKILLS FOR LAWYERS - Weekly Discussion', 'description': 'Weekly discussion session for Communication Skills for Lawyers', 'scheduled_time': timezone.now() + timedelta(days=6, hours=17, minutes=30), 'course_code': 'GPR3115'},
            {'title': 'COMMUNICATION SKILLS FOR LAWYERS - Assignment Review', 'description': 'Review of assignments and feedback session for Communication Skills for Lawyers', 'scheduled_time': timezone.now() + timedelta(days=12, hours=17, minutes=30), 'course_code': 'GPR3115'},
            
            # LEGAL RESEARCH AND WRITING
            {'title': 'LEGAL RESEARCH AND WRITING - Weekly Discussion', 'description': 'Weekly discussion session for Legal Research and Writing', 'scheduled_time': timezone.now() + timedelta(days=7, hours=17, minutes=30), 'course_code': 'GPR3117'},
            {'title': 'LEGAL RESEARCH AND WRITING - Assignment Review', 'description': 'Review of assignments and feedback session for Legal Research and Writing', 'scheduled_time': timezone.now() + timedelta(days=13, hours=17, minutes=30), 'course_code': 'GPR3117'},
        ]

        for meeting_data in meetings_data:
            course = demo_courses.get(meeting_data['course_code'])
            if course:
                meeting, created = Meeting.objects.get_or_create(
                    title=meeting_data['title'],
                    course=course,
                    defaults={
                        'description': meeting_data['description'],
                        'scheduled_time': meeting_data['scheduled_time'],
                        'duration': timedelta(hours=1),
                        'meeting_url': f'https://meet.example.com/{meeting_data["title"].lower().replace(" ", "-")}',
                        'created_by': admin_user
                    }
                )
                if created:
                    self.stdout.write(f'Created meeting: {meeting.title}')

        # Show summary
        self.stdout.write('\n=== DEMO DATA CREATION SUMMARY ===')
        self.stdout.write(f'Academic Year: {academic_year}')
        self.stdout.write(f'Demo Courses Created: {len(demo_courses)}')
        self.stdout.write(f'Timetable Entries: {TimetableEntry.objects.filter(course__in=demo_courses.values()).count()}')
        self.stdout.write(f'Course Materials: {CourseMaterial.objects.filter(course__in=demo_courses.values()).count()}')
        self.stdout.write(f'Recordings: {Recording.objects.filter(course__in=demo_courses.values()).count()}')
        self.stdout.write(f'Meetings: {Meeting.objects.filter(course__in=demo_courses.values()).count()}')
        
        self.stdout.write('\nDemo Courses:')
        for course in demo_courses.values():
            self.stdout.write(f'  - {course.code}: {course.name}')
        
        self.stdout.write('\nDemo Users:')
        self.stdout.write(f'  - Demo Student (Class of 2029): demo.student@uon.ac.ke / demo123')
        self.stdout.write(f'  - Student: john.doe@student.uon.ac.ke / student123')
        self.stdout.write('')
        self.stdout.write('Admin Setup:')
        self.stdout.write(f'  - Admin: admin@uon.ac.ke (password not set)')
        self.stdout.write('  - Run: python manage.py setup_admin to set admin password')
        
        self.stdout.write(
            self.style.SUCCESS('\n🎉 Successfully created comprehensive demo data!')
        )
        self.stdout.write(
            self.style.SUCCESS('Demo users now have full dashboard, calendar, and course content!')
        )