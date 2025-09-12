from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from course_api.models import Course, TimetableEntry, CourseMaterial, Recording, Meeting
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'Create University of Nairobi School of Law Module II data - First Year First Semester only (GPR31xx courses)'

    def handle(self, *args, **options):
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

        # Create sample course materials for first year courses
        first_year_courses = ['GPR3101', 'GPR3103', 'GPR3105', 'GPR3107', 'GPR3109', 'GPR3115', 'GPR3117']
        
        for course_code in first_year_courses:
            course = courses.get(course_code)
            if course:
                materials_data = [
                    {
                        'title': f'{course.name} - Course Outline',
                        'description': f'Detailed course outline and learning objectives for {course.name}',
                        'file_type': 'PDF'
                    },
                    {
                        'title': f'{course.name} - Reading List',
                        'description': f'Required and recommended readings for {course.name}',
                        'file_type': 'PDF'
                    },
                    {
                        'title': f'{course.name} - Lecture Notes 1',
                        'description': f'Introduction and basic concepts for {course.name}',
                        'file_type': 'PDF'
                    }
                ]
                
                for material_data in materials_data:
                    material, created = CourseMaterial.objects.get_or_create(
                        title=material_data['title'],
                        defaults={
                            'description': material_data['description'],
                            'file_type': material_data['file_type'],
                            'file_url': f'https://uon.ac.ke/law/materials/{course_code.lower()}_{material_data["title"].lower().replace(" ", "_").replace("-", "_")}.pdf',
                            'course': course,
                            'uploaded_by': admin_user
                        }
                    )
                    if created:
                        self.stdout.write(f'Created material: {material.title}')

        # Create sample recordings for first year courses
        for course_code in first_year_courses:
            course = courses.get(course_code)
            if course:
                recordings_data = [
                    {
                        'title': f'{course.name} - Lecture 1: Introduction',
                        'description': f'Introduction to {course.name} and course overview',
                        'duration': timedelta(hours=1, minutes=30)
                    },
                    {
                        'title': f'{course.name} - Lecture 2: Basic Concepts',
                        'description': f'Fundamental concepts and principles in {course.name}',
                        'duration': timedelta(hours=1, minutes=45)
                    }
                ]
                
                for recording_data in recordings_data:
                    recording, created = Recording.objects.get_or_create(
                        title=recording_data['title'],
                        defaults={
                            'description': recording_data['description'],
                            'duration': recording_data['duration'],
                            'video_url': f'https://uon.ac.ke/law/recordings/{course_code.lower()}_{recording_data["title"].lower().replace(" ", "_").replace("-", "_").replace(":", "")}.mp4',
                            'course': course,
                            'uploaded_by': admin_user
                        }
                    )
                    if created:
                        self.stdout.write(f'Created recording: {recording.title}')

        # Create sample meetings for first year courses
        for course_code in first_year_courses:
            course = courses.get(course_code)
            if course:
                meetings_data = [
                    {
                        'title': f'{course.name} - Weekly Discussion',
                        'description': f'Weekly discussion session for {course.name}',
                        'scheduled_time': timezone.now() + timedelta(days=1, hours=17, minutes=30)
                    },
                    {
                        'title': f'{course.name} - Assignment Review',
                        'description': f'Review of assignments and feedback session for {course.name}',
                        'scheduled_time': timezone.now() + timedelta(days=7, hours=17, minutes=30)
                    }
                ]
                
                for meeting_data in meetings_data:
                    meeting, created = Meeting.objects.get_or_create(
                        title=meeting_data['title'],
                        defaults={
                            'description': meeting_data['description'],
                            'scheduled_time': meeting_data['scheduled_time'],
                            'duration': timedelta(hours=1),
                            'meeting_url': f'https://meet.uon.ac.ke/{course_code.lower()}-{meeting_data["title"].lower().replace(" ", "-").replace(":", "")}',
                            'course': course,
                            'created_by': admin_user
                        }
                    )
                    if created:
                        self.stdout.write(f'Created meeting: {meeting.title}')

        self.stdout.write(
            self.style.SUCCESS('Successfully created UoN Law Module II data for First Year First Semester (GPR31xx courses)!')
        )