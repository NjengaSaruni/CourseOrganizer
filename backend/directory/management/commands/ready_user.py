from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from school.models import Class

User = get_user_model()


class Command(BaseCommand):
    help = 'Approve, verify, activate a user and assign them to the default class'

    def add_arguments(self, parser):
        parser.add_argument('--registration-number', type=str, help='User registration number')
        parser.add_argument('--email', type=str, help='User email')

    def handle(self, *args, **options):
        reg = options.get('registration_number')
        email = options.get('email')

        if not reg and not email:
            raise CommandError('Provide --registration-number or --email')

        try:
            if reg:
                user = User.objects.get(registration_number=reg)
            else:
                user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise CommandError('User not found')

        # Approve and verify
        user.status = 'approved'
        user.is_active = True
        user.email_verified = True
        if user.user_type != 'student':
            user.user_type = 'student'

        # Assign default class if missing
        if not getattr(user, 'student_class', None):
            default_class = Class.get_default_class()
            if not default_class:
                raise CommandError('Default class not configured. Run setup_school_structure first.')
            user.student_class = default_class

        user.save()

        self.stdout.write(self.style.SUCCESS(f'Readied user {user.get_full_name()} ({user.email})'))
        self.stdout.write(f"Status: {user.status}, Verified: {user.email_verified}, Class: {user.student_class}")


