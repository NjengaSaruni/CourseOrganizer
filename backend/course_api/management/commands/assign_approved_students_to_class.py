from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from school.models import Class

User = get_user_model()


class Command(BaseCommand):
    help = 'Assign all approved students without a class to the default class (Class of 2029)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force reassignment even if students already have a class',
        )
        parser.add_argument(
            '--class-id',
            type=int,
            help='Specific class ID to assign students to (defaults to default class)',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        class_id = options.get('class_id')
        
        # Get the target class
        if class_id:
            try:
                target_class = Class.objects.get(id=class_id, is_active=True)
                self.stdout.write(f'Using specified class: {target_class}')
            except Class.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Class with ID {class_id} not found'))
                return
        else:
            target_class = Class.get_default_class()
            if not target_class:
                self.stdout.write(self.style.ERROR('No default class found. Run setup_school_structure first.'))
                return
            self.stdout.write(f'Using default class: {target_class}')
        
        # Get students to assign
        if force:
            students = User.objects.filter(
                user_type='student',
                status='approved'
            )
            self.stdout.write(f'Force mode: Will reassign all {students.count()} approved students')
        else:
            students = User.objects.filter(
                user_type='student',
                status='approved',
                student_class__isnull=True
            )
            self.stdout.write(f'Found {students.count()} approved students without class assignment')
        
        if not students.exists():
            self.stdout.write(self.style.WARNING('No students found to assign'))
            return
        
        # Assign students to the class
        updated_count = 0
        for student in students:
            if not force and student.student_class:
                continue
                
            student.student_class = target_class
            student.save()
            updated_count += 1
            
            self.stdout.write(f'Assigned {student.get_full_name()} ({student.registration_number}) to {target_class}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully assigned {updated_count} students to {target_class}')
        )
        
        # Show final statistics
        total_in_class = target_class.student_count
        self.stdout.write(f'Total students in {target_class}: {total_in_class}')
