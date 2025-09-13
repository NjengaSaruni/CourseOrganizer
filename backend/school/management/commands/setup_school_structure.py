from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from school.models import School, Faculty, Department, Class
from directory.models import AcademicYear

User = get_user_model()


class Command(BaseCommand):
    help = 'Set up the initial school structure with School of Law and default class'

    def handle(self, *args, **options):
        self.stdout.write('Setting up school structure...')
        
        # Get or create academic year
        academic_year = AcademicYear.get_or_create_2025_2026()
        self.stdout.write(f'Using academic year: {academic_year}')
        
        # Create School of Law
        school, created = School.objects.get_or_create(
            code='LAW',
            defaults={
                'name': 'School of Law',
                'description': 'School of Law at University of Nairobi',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created school: {school}'))
        else:
            self.stdout.write(f'School already exists: {school}')
        
        # Create Faculty of Law
        faculty, created = Faculty.objects.get_or_create(
            school=school,
            code='LAW',
            defaults={
                'name': 'Faculty of Law',
                'description': 'Faculty of Law offering Bachelor of Laws program',
                'dean': 'Professor Law Dean',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created faculty: {faculty}'))
        else:
            self.stdout.write(f'Faculty already exists: {faculty}')
        
        # Create Department of Law
        department, created = Department.objects.get_or_create(
            faculty=faculty,
            code='LAW',
            defaults={
                'name': 'Department of Law',
                'description': 'Department of Law offering undergraduate and postgraduate programs',
                'head': 'Professor Department Head',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created department: {department}'))
        else:
            self.stdout.write(f'Department already exists: {department}')
        
        # Create default class for 2025-2029 (Class of 2029)
        class_obj, created = Class.objects.get_or_create(
            department=department,
            graduation_year=2029,
            defaults={
                'name': 'Class of 2029',
                'program': 'Bachelor of Laws (LLB)',
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
