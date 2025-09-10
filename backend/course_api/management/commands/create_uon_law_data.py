from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from course_api.models import Course, TimetableEntry, CourseMaterial, Recording, Meeting
from datetime import datetime, timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Create University of Nairobi School of Law Module II data'

    def handle(self, *args, **options):
        self.stdout.write('Creating UoN Law Module II data...')

        # Create demo users (keep existing ones)
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

        # Clear existing data
        Course.objects.all().delete()
        TimetableEntry.objects.all().delete()
        CourseMaterial.objects.all().delete()
        Recording.objects.all().delete()
        Meeting.objects.all().delete()

        # Create real UoN Law courses
        courses_data = [
            # First Year Courses (GPR3xxx)
            {'code': 'GPR3101', 'name': 'TORTS I', 'description': 'Introduction to tort law and civil wrongs'},
            {'code': 'GPR3103', 'name': 'CONTRACTS I', 'description': 'Fundamentals of contract law'},
            {'code': 'GPR3105', 'name': 'CRIMINAL LAW I', 'description': 'Introduction to criminal law principles'},
            {'code': 'GPR3107', 'name': 'CONSTITUTIONAL LAW I', 'description': 'Constitutional principles and governance'},
            {'code': 'GPR3109', 'name': 'LEGAL SYSTEMS AND LEGAL METHODS', 'description': 'Legal systems and research methods'},
            {'code': 'GPR3115', 'name': 'COMMUNICATION SKILLS FOR LAWYERS', 'description': 'Professional communication skills'},
            {'code': 'GPR3117', 'name': 'LEGAL RESEARCH AND WRITING', 'description': 'Legal research and writing techniques'},
            
            # Second Year Courses (GPR32xx)
            {'code': 'GPR3201', 'name': 'EVIDENCE I', 'description': 'Law of evidence in legal proceedings'},
            {'code': 'GPR3203', 'name': 'ADMINISTRATIVE LAW I', 'description': 'Administrative law principles'},
            {'code': 'GPR3205', 'name': 'PROPERTY THEORY', 'description': 'Theoretical foundations of property law'},
            {'code': 'GPR3206', 'name': 'EQUITY', 'description': 'Equity and equitable remedies'},
            {'code': 'GPR3207', 'name': 'HUMAN RIGHTS LAW', 'description': 'International and domestic human rights'},
            {'code': 'GPR3211', 'name': 'FAMILY LAW', 'description': 'Family law and domestic relations'},
            
            # Third Year Courses (GPR33xx)
            {'code': 'GPR3300', 'name': 'JURISPRUDENCE', 'description': 'Legal philosophy and theory'},
            {'code': 'GPR3301', 'name': 'PUBLIC INTERNATIONAL LAW', 'description': 'International law principles'},
            {'code': 'GPR3303', 'name': 'LAW OF BUSINESS ASSOCIATIONS I', 'description': 'Company law fundamentals'},
            {'code': 'GPR3305', 'name': 'CIVIL PROCEDURE I', 'description': 'Civil procedure and litigation'},
            {'code': 'GPR3307', 'name': 'ADVANCED LEGAL WRITING AND RESEARCH', 'description': 'Advanced legal writing skills'},
            {'code': 'GPR3309', 'name': 'CRIMINAL PROCEDURE', 'description': 'Criminal procedure and practice'},
            {'code': 'GPR3316', 'name': 'LAW OF BUSINESS ASSOCIATIONS II', 'description': 'Advanced company law'},
            
            # Fourth Year Courses (GPR34xx)
            {'code': 'GPR3403', 'name': 'CONFLICT OF LAWS', 'description': 'Private international law'},
            {'code': 'GPR3411', 'name': 'INTELLECTUAL PROPERTY LAW', 'description': 'IP law and protection'},
            {'code': 'GPR3414', 'name': 'PROFESSIONAL ETHICS', 'description': 'Legal ethics and professional conduct'},
            {'code': 'GPR3415', 'name': 'CONSUMER PROTECTION LAW', 'description': 'Consumer rights and protection'},
            {'code': 'GPR3416', 'name': 'LAW OF THE SEA', 'description': 'Maritime and sea law'},
            {'code': 'GPR3420', 'name': 'ENERGY LAW', 'description': 'Energy sector legal framework'},
            {'code': 'GPR3422', 'name': 'LAW, DEMOCRACY AND GOVERNANCE', 'description': 'Democratic governance and law'},
            {'code': 'GPR3423', 'name': 'BANKING LAW', 'description': 'Banking and financial law'},
            {'code': 'GPR3424', 'name': 'INSURANCE LAW', 'description': 'Insurance law and regulation'},
            {'code': 'GPR3425', 'name': 'TAX LAW', 'description': 'Taxation law and practice'},
            {'code': 'GPR3427', 'name': 'CHILDREN AND THE LAW', 'description': 'Child rights and protection'},
            {'code': 'GPR3431', 'name': 'HEALTH LAW AND POLICY', 'description': 'Healthcare law and policy'},
            {'code': 'GPR3432', 'name': 'ENVIRONMENTAL AND NATURAL RESOURCES LAW', 'description': 'Environmental protection law'},
            {'code': 'GPR3436', 'name': 'INTERNATIONAL CRIMINAL LAW', 'description': 'International criminal justice'},
            {'code': 'GPR3457', 'name': 'DISABILITY RIGHTS LAW', 'description': 'Disability rights and inclusion'},
            {'code': 'GPR3458', 'name': 'SPORTS AND ENTERTAINMENT LAW', 'description': 'Sports and entertainment legal issues'},
            {'code': 'GPR3459', 'name': 'FOOD LAW AND POLICY', 'description': 'Food safety and regulation'},
            {'code': 'GPR3460', 'name': 'CRIMINOLOGY AND PENOLOGY', 'description': 'Criminology and punishment theory'},
            {'code': 'GPR3461', 'name': 'ISLAMIC JURISPRUDENCE', 'description': 'Islamic law principles'},
            {'code': 'GPR3462', 'name': 'LAW AND LANGUAGE', 'description': 'Language and legal interpretation'},
            {'code': 'GPR3463', 'name': 'PUBLIC INTEREST CLINIC', 'description': 'Public interest legal practice'},
            {'code': 'GPR3468', 'name': 'RESEARCH PROPOSAL', 'description': 'Legal research methodology'},
        ]

        courses = {}
        for course_data in courses_data:
            course, created = Course.objects.get_or_create(
                code=course_data['code'],
                defaults={
                    'name': course_data['name'],
                    'description': course_data['description']
                }
            )
            courses[course_data['code']] = course
            if created:
                self.stdout.write(f'Created course: {course.name}')

        # Create timetable entries based on the provided schedule
        timetable_data = [
            # Monday
            {'day': 'monday', 'code': 'GPR3107', 'subject': 'CONSTITUTIONAL LAW I', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'S. Alosa'},
            {'day': 'monday', 'code': 'GPR3211', 'subject': 'FAMILY LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'A. Shah/C. Shilaho'},
            {'day': 'monday', 'code': 'GPR3307', 'subject': 'ADVANCED LEGAL WRITING AND RESEARCH', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'R. Rogo/M. Jadeed'},
            {'day': 'monday', 'code': 'GPR3416', 'subject': 'LAW OF THE SEA', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'N. Maru'},
            {'day': 'monday', 'code': 'GPR3423', 'subject': 'BANKING LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'N. Gichuki'},
            {'day': 'monday', 'code': 'GPR3457', 'subject': 'DISABILITY RIGHTS LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'L. Mute/ S. Alosa'},
            {'day': 'monday', 'code': 'GPR3459', 'subject': 'FOOD LAW AND POLICY', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'F.Jaoko/J.Adogo'},
            {'day': 'monday', 'code': 'GPR3461', 'subject': 'ISLAMIC JURISPRUDENCE', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'M. Bakari'},
            
            # Tuesday
            {'day': 'tuesday', 'code': 'GPR3103', 'subject': 'CONTRACTS I', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'J.Murungi/ M. Okelloh'},
            {'day': 'tuesday', 'code': 'GPR3205', 'subject': 'PROPERTY THEORY', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'M.Deche/P. Pete'},
            {'day': 'tuesday', 'code': 'GPR3425', 'subject': 'TAX LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'F. Kaburu'},
            {'day': 'tuesday', 'code': 'GPR3427', 'subject': 'CHILDREN AND THE LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'R. Rogo'},
            {'day': 'tuesday', 'code': 'GPR3431', 'subject': 'HEALTH LAW AND POLICY', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'N.Njuguna'},
            {'day': 'tuesday', 'code': 'GPR3432', 'subject': 'ENVIRONMENTAL AND NATURAL RESOURCES LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'J. Adogo'},
            {'day': 'tuesday', 'code': 'GPR3463', 'subject': 'PUBLIC INTEREST CLINIC', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'N. Sitonic'},
            
            # Wednesday
            {'day': 'wednesday', 'code': 'GPR3109', 'subject': 'LEGAL SYSTEMS AND LEGAL METHODS', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'S. Ouma'},
            {'day': 'wednesday', 'code': 'GPR3207', 'subject': 'HUMAN RIGHTS LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'F. Oduor'},
            {'day': 'wednesday', 'code': 'GPR3300', 'subject': 'JURISPRUDENCE', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'P. Pete'},
            {'day': 'wednesday', 'code': 'GPR3415', 'subject': 'CONSUMER PROTECTION LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'J.Asiema'},
            {'day': 'wednesday', 'code': 'GPR3422', 'subject': 'LAW, DEMOCRACY AND GOVERNANCE', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'S. Alosa'},
            {'day': 'wednesday', 'code': 'GPR3436', 'subject': 'INTERNATIONAL CRIMINAL LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'R. Rogo'},
            {'day': 'wednesday', 'code': 'GPR3462', 'subject': 'LAW AND LANGUAGE', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'N.Kabira'},
            
            # Thursday
            {'day': 'thursday', 'code': 'GPR3101', 'subject': 'TORTS I', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'V. Yatani/P. Pete'},
            {'day': 'thursday', 'code': 'GPR3201', 'subject': 'EVIDENCE I', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'P. Ogendi/M. Bakari'},
            {'day': 'thursday', 'code': 'GPR3303', 'subject': 'LAW OF BUSINESS ASSOCIATIONS I', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'S.Ngare'},
            {'day': 'thursday', 'code': 'GPR3316', 'subject': 'LAW OF BUSINESS ASSOCIATIONS II', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'S. Ngare'},
            {'day': 'thursday', 'code': 'GPR3414', 'subject': 'PROFESSIONAL ETHICS', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'M.Deche'},
            
            # Friday
            {'day': 'friday', 'code': 'GPR3115', 'subject': 'COMMUNICATION SKILLS FOR LAWYERS', 'time': '08:00 - 11:00', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'N. Maru/M. Okelloh'},
            {'day': 'friday', 'code': 'GPR3117', 'subject': 'LEGAL RESEARCH AND WRITING', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'S. Kinyanjui'},
            {'day': 'friday', 'code': 'GPR3203', 'subject': 'ADMINISTRATIVE LAW I', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'W. Ndegwa/ M. Okelloh'},
            {'day': 'friday', 'code': 'GPR3301', 'subject': 'PUBLIC INTERNATIONAL LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'S.Kinyanjui'},
            {'day': 'friday', 'code': 'GPR3403', 'subject': 'CONFLICT OF LAWS', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'L. Aloo'},
            {'day': 'friday', 'code': 'GPR3411', 'subject': 'INTELLECTUAL PROPERTY LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'R.Gitau/P.Pete'},
            {'day': 'friday', 'code': 'GPR3420', 'subject': 'ENERGY LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'J.Murungi'},
            {'day': 'friday', 'code': 'GPR3424', 'subject': 'INSURANCE LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'R. Gitau'},
            {'day': 'friday', 'code': 'GPR3458', 'subject': 'SPORTS AND ENTERTAINMENT LAW', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'S. Wekesa'},
            
            # Saturday
            {'day': 'saturday', 'code': 'GPR3105', 'subject': 'CRIMINAL LAW I', 'time': '11:00 - 14:00', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'N. Sitonic/ C. Shilaho'},
            {'day': 'saturday', 'code': 'GPR3206', 'subject': 'EQUITY', 'time': '08:00 - 11:00', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'R. Kariuki/J. Asiema'},
            {'day': 'saturday', 'code': 'GPR3305', 'subject': 'CIVIL PROCEDURE I', 'time': '08:00 - 11:00', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'S.Ouma'},
            {'day': 'saturday', 'code': 'GPR3309', 'subject': 'CRIMINAL PROCEDURE', 'time': '17:30 - 20:30', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'F.Oduor'},
            {'day': 'saturday', 'code': 'GPR3460', 'subject': 'CRIMINOLOGY AND PENOLOGY', 'time': '11:00 - 14:00', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'K. Mbulu'},
            {'day': 'saturday', 'code': 'GPR3468', 'subject': 'RESEARCH PROPOSAL', 'time': '08:00 - 11:00', 'location': 'ONLINE', 'group': 'Group 1', 'lecturer': 'W. Ndegwa/ R.Rogo'},
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
                        'scheduled_time': datetime.now() + timedelta(days=1, hours=17, minutes=30)
                    },
                    {
                        'title': f'{course.name} - Assignment Review',
                        'description': f'Review of assignments and feedback session for {course.name}',
                        'scheduled_time': datetime.now() + timedelta(days=7, hours=17, minutes=30)
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
            self.style.SUCCESS('Successfully created UoN Law Module II data!')
        )