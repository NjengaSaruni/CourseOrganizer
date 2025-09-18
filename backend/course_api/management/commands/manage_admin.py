import secrets
import string
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.core.management.utils import get_random_secret_key

User = get_user_model()


class Command(BaseCommand):
    help = 'Manage admin user account securely'

    def add_arguments(self, parser):
        parser.add_argument('action', type=str, choices=['create', 'reset-password', 'status', 'delete'],
                           help='Action to perform: create, reset-password, status, delete')
        parser.add_argument('--email', type=str, default='admin@uon.ac.ke',
                           help='Admin email address (default: admin@uon.ac.ke)')
        parser.add_argument('--password', type=str,
                           help='Admin password (if not provided, a secure random password will be generated)')
        parser.add_argument('--force', action='store_true',
                           help='Force action without confirmation')

    def handle(self, *args, **options):
        action = options['action']
        email = options['email']
        password = options['password']
        force = options['force']

        if action == 'create':
            self._create_admin(email, password, force)
        elif action == 'reset-password':
            self._reset_password(email, password, force)
        elif action == 'status':
            self._check_status(email)
        elif action == 'delete':
            self._delete_admin(email, force)

    def _generate_secure_password(self, length=16):
        """Generate a secure random password"""
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        return password

    def _create_admin(self, email, password, force):
        """Create a new admin user"""
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f"Admin user with email {email} already exists.")
            )
            if not force:
                response = input("Do you want to reset the password? (y/N): ")
                if response.lower() != 'y':
                    return
                self._reset_password(email, password, True)
            return

        if not password:
            password = self._generate_secure_password()
            self.stdout.write(
                self.style.WARNING(f"Generated secure password: {password}")
            )
            self.stdout.write(
                self.style.WARNING("⚠️  IMPORTANT: Save this password securely! It won't be shown again.")
            )

        try:
            admin = User.objects.create_superuser(
                email=email,
                password=password,
                first_name='Admin',
                last_name='User',
                registration_number='GPR3/000001/2025',
                phone_number='+254700000000',
                user_type='admin'
            )
            self.stdout.write(
                self.style.SUCCESS(f'✅ Admin user created successfully!')
            )
            self.stdout.write(f'📧 Email: {email}')
            self.stdout.write(f'🔑 Password: {password}')
            self.stdout.write(f'🆔 Registration: {admin.registration_number}')
            self.stdout.write(f'📞 Phone: {admin.phone_number}')
        except Exception as e:
            raise CommandError(f'Failed to create admin user: {e}')

    def _reset_password(self, email, password, force):
        """Reset admin password"""
        try:
            admin = User.objects.get(email=email, is_superuser=True)
        except User.DoesNotExist:
            raise CommandError(f"Admin user with email {email} not found.")

        if not password:
            password = self._generate_secure_password()
            self.stdout.write(
                self.style.WARNING(f"Generated secure password: {password}")
            )
            self.stdout.write(
                self.style.WARNING("⚠️  IMPORTANT: Save this password securely! It won't be shown again.")
            )

        if not force:
            response = input(f"Are you sure you want to reset password for {email}? (y/N): ")
            if response.lower() != 'y':
                self.stdout.write("Password reset cancelled.")
                return

        admin.set_password(password)
        admin.save()

        self.stdout.write(
            self.style.SUCCESS(f'✅ Admin password reset successfully!')
        )
        self.stdout.write(f'📧 Email: {email}')
        self.stdout.write(f'🔑 New Password: {password}')

    def _check_status(self, email):
        """Check admin user status"""
        try:
            admin = User.objects.get(email=email, is_superuser=True)
            self.stdout.write(
                self.style.MIGRATE_HEADING(f"Admin User Status for {email}:")
            )
            self.stdout.write(f'👤 Name: {admin.get_full_name()}')
            self.stdout.write(f'📧 Email: {admin.email}')
            self.stdout.write(f'🆔 Registration: {admin.registration_number}')
            self.stdout.write(f'📞 Phone: {admin.phone_number}')
            self.stdout.write(f'✅ Is Superuser: {admin.is_superuser}')
            self.stdout.write(f'👨‍💼 Is Staff: {admin.is_staff}')
            self.stdout.write(f'🟢 Is Active: {admin.is_active}')
            self.stdout.write(f'🗓️ Date Joined: {admin.date_joined}')
            self.stdout.write(f'🕐 Last Login: {admin.last_login or "Never"}')
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f"Admin user with email {email} not found.")
            )

    def _delete_admin(self, email, force):
        """Delete admin user"""
        try:
            admin = User.objects.get(email=email, is_superuser=True)
        except User.DoesNotExist:
            raise CommandError(f"Admin user with email {email} not found.")

        if not force:
            response = input(f"Are you sure you want to DELETE admin user {email}? This cannot be undone! (y/N): ")
            if response.lower() != 'y':
                self.stdout.write("Admin deletion cancelled.")
                return

        admin_name = admin.get_full_name()
        admin.delete()

        self.stdout.write(
            self.style.SUCCESS(f'✅ Admin user {admin_name} ({email}) deleted successfully!')
        )
