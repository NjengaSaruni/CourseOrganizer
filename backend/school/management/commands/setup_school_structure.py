from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from school.models import School, Faculty, Department, Class
from directory.models import AcademicYear

User = get_user_model()


class Command(BaseCommand):
    help = 'Set up the initial school structure with configurable entities'

    def add_arguments(self, parser):
        parser.add_argument('--school-code', type=str, default='LAW', help='School code (default: LAW)')
        parser.add_argument('--school-name', type=str, default='School of Law', help='School name')
        parser.add_argument('--faculty-code', type=str, default='LAW', help='Faculty code')
        parser.add_argument('--faculty-name', type=str, default='Faculty of Law', help='Faculty name')
        parser.add_argument('--department-code', type=str, default='LAW', help='Department code')
        parser.add_argument('--department-name', type=str, default='Department of Law', help='Department name')
        parser.add_argument('--graduation-year', type=int, default=2029, help='Default class graduation year')
        parser.add_argument('--class-name', type=str, default='Class of 2029', help='Default class name')
        parser.add_argument('--program', type=str, default='Bachelor of Laws (LLB)', help='Program name')

    def handle(self, *args, **options):
        self.stdout.write('Setting up school structure...')
        
        # Get or create academic year
        academic_year = AcademicYear.get_or_create_2025_2026()
        self.stdout.write(f'Using academic year: {academic_year}')
        
        # Create School
        school, created = School.objects.get_or_create(
            code=options.get('school-code') or options.get('school_code') or 'LAW',
            defaults={
                'name': options.get('school-name') or options.get('school_name') or 'School of Law',
                'description': f"{(options.get('school-name') or options.get('school_name') or 'School of Law')} - auto created",
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created school: {school}'))
        else:
            self.stdout.write(f'School already exists: {school}')
        
        # Create Faculty
        faculty, created = Faculty.objects.get_or_create(
            school=school,
            code=options.get('faculty-code') or options.get('faculty_code') or 'LAW',
            defaults={
                'name': options.get('faculty-name') or options.get('faculty_name') or 'Faculty of Law',
                'description': f"{(options.get('faculty-name') or options.get('faculty_name') or 'Faculty of Law')} offering programs",
                'dean': 'Professor Law Dean',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created faculty: {faculty}'))
        else:
            self.stdout.write(f'Faculty already exists: {faculty}')
        
        # Create Department
        department, created = Department.objects.get_or_create(
            faculty=faculty,
            code=options.get('department-code') or options.get('department_code') or 'LAW',
            defaults={
                'name': options.get('department-name') or options.get('department_name') or 'Department of Law',
                'description': f"{(options.get('department-name') or options.get('department_name') or 'Department of Law')} offering undergraduate and postgraduate programs",
                'head': 'Professor Department Head',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created department: {department}'))
        else:
            self.stdout.write(f'Department already exists: {department}')
        
        # Create default class
        class_obj, created = Class.objects.get_or_create(
            department=department,
            graduation_year=options.get('graduation-year') or options.get('graduation_year') or 2029,
            defaults={
                'name': options.get('class-name') or options.get('class_name') or 'Class of 2029',
                'program': options.get('program') or 'Bachelor of Laws (LLB)',
                'academic_year': academic_year,
                'is_active': True,
                'is_default': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created default class: {class_obj}'))
        else:
            # Ensure it's marked as default
            if not class_obj.is_default:
                class_obj.is_default = True
                class_obj.save()
                self.stdout.write(self.style.SUCCESS(f'Updated class to be default: {class_obj}'))
            else:
                self.stdout.write(f'Default class already exists: {class_obj}')
        
        # Assign all approved students to the default class
        approved_students = User.objects.filter(
            user_type='student',
            status='approved',
            student_class__isnull=True
        )
        
        if approved_students.exists():
            updated_count = approved_students.update(student_class=class_obj)
            self.stdout.write(self.style.SUCCESS(f'Assigned {updated_count} students to default class'))
        else:
            self.stdout.write('No unassigned approved students found')
        
        # Show summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write('School Structure Summary:')
        self.stdout.write('='*50)
        self.stdout.write(f'School: {school}')
        self.stdout.write(f'Faculty: {faculty}')
        self.stdout.write(f'Department: {department}')
        self.stdout.write(f'Default Class: {class_obj}')
        self.stdout.write(f'Students in default class: {class_obj.student_count}')
        self.stdout.write('='*50)
