from django.core.management.base import BaseCommand
from django.db.models import Count
from communication.models import ClassRepRole
from school.models import Class


class Command(BaseCommand):
    help = 'List all Class Representatives'

    def add_arguments(self, parser):
        parser.add_argument(
            '--class-id',
            type=int,
            help='Filter by specific class ID',
        )
        parser.add_argument(
            '--active-only',
            action='store_true',
            help='Show only active Class Reps',
        )
        parser.add_argument(
            '--with-permissions',
            action='store_true',
            help='Show detailed permissions for each Class Rep',
        )

    def handle(self, *args, **options):
        class_id = options.get('class_id')
        active_only = options.get('active_only')
        with_permissions = options.get('with_permissions')

        # Build queryset
        queryset = ClassRepRole.objects.select_related('user', 'student_class', 'assigned_by')
        
        if active_only:
            queryset = queryset.filter(is_active=True)
        
        if class_id:
            try:
                target_class = Class.objects.get(id=class_id)
                queryset = queryset.filter(student_class=target_class)
                self.stdout.write(f'Class Representatives for {target_class.display_name}:\n')
            except Class.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Class with ID {class_id} does not exist'))
                return

        class_reps = queryset.order_by('student_class__name', 'user__first_name')

        if not class_reps.exists():
            self.stdout.write(self.style.WARNING('No Class Representatives found'))
            return

        # Group by class
        current_class = None
        for class_rep in class_reps:
            if class_rep.student_class != current_class:
                current_class = class_rep.student_class
                if not class_id:  # Only show class header if not filtering by class
                    self.stdout.write(f'\n{class_rep.student_class.display_name}:')
                    self.stdout.write('=' * len(class_rep.student_class.display_name))

            status_text = 'ACTIVE' if class_rep.is_active else 'INACTIVE'
            status_style = self.style.SUCCESS if class_rep.is_active else self.style.ERROR
            
            rep_info = (
                f'  {class_rep.user.get_full_name()} '
                f'({class_rep.user.registration_number}) - {status_style(status_text)}'
            )
            
            if with_permissions:
                permission_labels = {
                    'send_announcements': 'Send Announcements',
                    'moderate_messages': 'Moderate Messages',
                    'view_all_messages': 'View All Messages',
                    'manage_polls': 'Manage Polls',
                    'send_notifications': 'Send Notifications',
                }
                
                permissions_text = ', '.join([
                    permission_labels.get(p, p) for p in class_rep.permissions
                ])
                rep_info += f'\n    Permissions: {permissions_text}'
                
                if class_rep.assigned_by:
                    rep_info += f'\n    Assigned by: {class_rep.assigned_by.get_full_name()}'
                    rep_info += f'\n    Assigned on: {class_rep.assigned_at.strftime("%Y-%m-%d %H:%M")}'

            self.stdout.write(rep_info)

        # Summary statistics
        total_reps = class_reps.count()
        active_reps = class_reps.filter(is_active=True).count()
        
        self.stdout.write(f'\nSummary:')
        self.stdout.write(f'  Total Class Representatives: {total_reps}')
        self.stdout.write(f'  Active: {active_reps}')
        self.stdout.write(f'  Inactive: {total_reps - active_reps}')
        
        # Show classes without Class Reps
        if not class_id:
            classes_without_reps = Class.objects.filter(is_active=True).exclude(
                id__in=class_reps.values_list('student_class_id', flat=True)
            )
            
            if classes_without_reps.exists():
                self.stdout.write(f'\nClasses without Class Representatives:')
                for class_obj in classes_without_reps:
                    self.stdout.write(
                        self.style.WARNING(f'  - {class_obj.display_name}')
                    )
