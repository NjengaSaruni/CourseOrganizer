from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from communication.models import ClassRepRole
from school.models import Class

User = get_user_model()


class Command(BaseCommand):
    help = 'Assign Class Representative role to a student'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='ID of the user to assign as Class Rep',
        )
        parser.add_argument(
            '--registration-number',
            type=str,
            help='Registration number of the user to assign as Class Rep',
        )
        parser.add_argument(
            '--permissions',
            nargs='+',
            default=['send_announcements'],
            choices=[
                'send_announcements',
                'moderate_messages',
                'view_all_messages',
                'manage_polls',
                'send_notifications',
            ],
            help='Permissions to assign to the Class Rep',
        )
        parser.add_argument(
            '--class-id',
            type=int,
            help='ID of the class (if different from user\'s class)',
        )
        parser.add_argument(
            '--deactivate',
            action='store_true',
            help='Deactivate an existing Class Rep role',
        )

    def handle(self, *args, **options):
        user_id = options.get('user_id')
        registration_number = options.get('registration_number')
        permissions = options.get('permissions')
        class_id = options.get('class_id')
        deactivate = options.get('deactivate')

        # Find the user
        user = None
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                raise CommandError(f'User with ID {user_id} does not exist')
        elif registration_number:
            try:
                user = User.objects.get(registration_number=registration_number)
            except User.DoesNotExist:
                raise CommandError(f'User with registration number {registration_number} does not exist')
        else:
            raise CommandError('You must provide either --user-id or --registration-number')

        if not user.is_student:
            raise CommandError(f'User {user.get_full_name()} is not a student')

        # Determine the class
        target_class = None
        if class_id:
            try:
                target_class = Class.objects.get(id=class_id)
            except Class.DoesNotExist:
                raise CommandError(f'Class with ID {class_id} does not exist')
        else:
            target_class = user.student_class

        if not target_class:
            raise CommandError(f'User {user.get_full_name()} is not assigned to any class')

        if user.student_class != target_class:
            self.stdout.write(
                self.style.WARNING(
                    f'Warning: User {user.get_full_name()} belongs to {user.student_class.display_name} '
                    f'but you are assigning them as Class Rep for {target_class.display_name}'
                )
            )

        # Handle deactivation
        if deactivate:
            try:
                class_rep = ClassRepRole.objects.get(user=user, student_class=target_class)
                class_rep.is_active = False
                class_rep.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully deactivated Class Rep role for {user.get_full_name()} '
                        f'in {target_class.display_name}'
                    )
                )
            except ClassRepRole.DoesNotExist:
                raise CommandError(
                    f'{user.get_full_name()} is not a Class Rep for {target_class.display_name}'
                )
            return

        # Create or update Class Rep role
        class_rep, created = ClassRepRole.objects.update_or_create(
            user=user,
            student_class=target_class,
            defaults={
                'permissions': permissions,
                'is_active': True,
                'assigned_by': User.objects.filter(is_superuser=True).first(),
            }
        )

        action = 'Created' if created else 'Updated'
        self.stdout.write(
            self.style.SUCCESS(
                f'{action} Class Rep role for {user.get_full_name()} '
                f'in {target_class.display_name} with permissions: {", ".join(permissions)}'
            )
        )

        # Display current Class Reps for the class
        active_reps = ClassRepRole.objects.filter(
            student_class=target_class,
            is_active=True
        ).select_related('user')

        if active_reps.exists():
            self.stdout.write('\nCurrent Class Representatives for this class:')
            for rep in active_reps:
                self.stdout.write(
                    f'  - {rep.user.get_full_name()} ({rep.user.registration_number}): '
                    f'{", ".join(rep.permissions)}'
                )
