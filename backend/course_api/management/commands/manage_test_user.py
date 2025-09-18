from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from course_api.models import AcademicYear
import secrets
import string

User = get_user_model()


class Command(BaseCommand):
    help = 'Manage test user for email template testing'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            choices=['create', 'delete', 'reset', 'status'],
            help='Action to perform: create, delete, reset, or status'
        )
        parser.add_argument(
            '--registration-number',
            type=str,
            default='GPR3/150561/2025',
            help='Registration number for the test user (default: GPR3/150561/2025)'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='test.student@example.com',
            help='Email for the test user (default: test.student@example.com)'
        )

    def handle(self, *args, **options):
        action = options['action']
        registration_number = options['registration_number']
        email = options['email']
        
        if action == 'create':
            self.create_test_user(registration_number, email)
        elif action == 'delete':
            self.delete_test_user(registration_number)
        elif action == 'reset':
            self.reset_test_user(registration_number, email)
        elif action == 'status':
            self.check_test_user_status(registration_number)

    def create_test_user(self, registration_number, email):
        """Create a new test user"""
        try:
            # Check if user already exists
            if User.objects.filter(registration_number=registration_number).exists():
                self.stdout.write(
                    self.style.WARNING(f'User with registration number {registration_number} already exists')
                )
                return
            
            # Get academic year
            academic_year = AcademicYear.get_or_create_2025_2026()
            
            # Generate a random password
            password = self.generate_test_password()
            
            # Create test user
            user = User.objects.create_user(
                email=email,
                password=password,
                first_name='Test',
                last_name='Student',
                registration_number=registration_number,
                phone_number='+254700000000',
                status='pending',  # Start as pending to test approval flow
                is_active=True,
                current_year=1,
                current_semester=1,
                class_of=2029,
                academic_year=academic_year,
                user_type='student',
                email_verified=False
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Test user created successfully!')
            )
            self.stdout.write(f'📧 Email: {email}')
            self.stdout.write(f'🆔 Registration: {registration_number}')
            self.stdout.write(f'🔑 Password: {password}')
            self.stdout.write(f'📊 Status: {user.status}')
            self.stdout.write(f'✅ Email Verified: {user.email_verified}')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed to create test user: {str(e)}')
            )

    def delete_test_user(self, registration_number):
        """Delete the test user"""
        try:
            user = User.objects.get(registration_number=registration_number)
            user_name = user.get_full_name()
            user_email = user.email
            
            user.delete()
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Test user deleted successfully!')
            )
            self.stdout.write(f'👤 Deleted: {user_name} ({user_email})')
            self.stdout.write(f'🆔 Registration: {registration_number}')
            
        except User.DoesNotExist:
            self.stdout.write(
                self.style.WARNING(f'⚠️ User with registration number {registration_number} not found')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed to delete test user: {str(e)}')
            )

    def reset_test_user(self, registration_number, email):
        """Reset test user (delete and recreate)"""
        self.stdout.write('🔄 Resetting test user...')
        
        # Delete existing user
        self.delete_test_user(registration_number)
        
        # Create new user
        self.create_test_user(registration_number, email)

    def check_test_user_status(self, registration_number):
        """Check the status of the test user"""
        try:
            user = User.objects.get(registration_number=registration_number)
            
            self.stdout.write(
                self.style.SUCCESS(f'📊 Test User Status:')
            )
            self.stdout.write(f'👤 Name: {user.get_full_name()}')
            self.stdout.write(f'📧 Email: {user.email}')
            self.stdout.write(f'🆔 Registration: {user.registration_number}')
            self.stdout.write(f'📊 Status: {user.status}')
            self.stdout.write(f'✅ Email Verified: {user.email_verified}')
            self.stdout.write(f'🔐 Is Active: {user.is_active}')
            self.stdout.write(f'📅 Created: {user.created_at}')
            self.stdout.write(f'🔄 Updated: {user.updated_at}')
            
            if user.email_verification_token:
                self.stdout.write(f'🔑 Verification Token: {user.email_verification_token[:20]}...')
            
        except User.DoesNotExist:
            self.stdout.write(
                self.style.WARNING(f'⚠️ User with registration number {registration_number} not found')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed to check test user status: {str(e)}')
            )

    def generate_test_password(self):
        """Generate a test password"""
        # Generate a memorable test password
        return 'TestPass123!'
