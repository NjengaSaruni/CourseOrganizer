from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from getpass import getpass
import sys

User = get_user_model()


class Command(BaseCommand):
    help = 'Set up admin account with manual password input'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='admin@uon.ac.ke',
            help='Admin email address (default: admin@uon.ac.ke)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force password reset even if admin exists'
        )

    def handle(self, *args, **options):
        email = options['email']
        force = options['force']
        
        self.stdout.write('🔐 Setting up admin account...')
        self.stdout.write(f'Email: {email}')
        
        # Check if admin already exists
        try:
            admin_user = User.objects.get(email=email)
            if not force:
                self.stdout.write(
                    self.style.WARNING(f'Admin user {email} already exists!')
                )
                self.stdout.write('Use --force to reset password')
                return
            else:
                self.stdout.write(f'Updating existing admin user: {email}')
        except User.DoesNotExist:
            self.stdout.write(f'Creating new admin user: {email}')
            admin_user = User(
                email=email,
                first_name='Admin',
                last_name='User',
                registration_number='GPR3/000001/2025',
                phone_number='+254 700 000 000',
                status='approved',
                is_active=True,
                is_staff=True,
                is_superuser=True,
                user_type='admin',
                username=email
            )
        
        # Get password from user input
        while True:
            try:
                password = getpass('Enter admin password: ')
                if not password:
                    self.stdout.write(self.style.ERROR('Password cannot be empty!'))
                    continue
                
                confirm_password = getpass('Confirm admin password: ')
                if password != confirm_password:
                    self.stdout.write(self.style.ERROR('Passwords do not match!'))
                    continue
                
                if len(password) < 8:
                    self.stdout.write(self.style.ERROR('Password must be at least 8 characters long!'))
                    continue
                
                break
            except KeyboardInterrupt:
                self.stdout.write('\nOperation cancelled.')
                sys.exit(1)
        
        # Set password and save
        admin_user.set_password(password)
        admin_user.save()
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Admin account setup complete!')
        )
        self.stdout.write(f'Email: {email}')
        self.stdout.write('Password: [HIDDEN]')
        self.stdout.write('')
        self.stdout.write('Admin can now:')
        self.stdout.write('  - Access /admin route')
        self.stdout.write('  - Approve/reject student registrations')
        self.stdout.write('  - Manage courses and content')
        self.stdout.write('  - View all system data')
