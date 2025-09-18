from django.core.management.base import BaseCommand
from directory.models import User


class Command(BaseCommand):
    help = 'Check user status and information'

    def add_arguments(self, parser):
        parser.add_argument('--user-id', type=int, help='User ID to check')
        parser.add_argument('--email', type=str, help='Email to check')
        parser.add_argument('--list-all', action='store_true', help='List all users')

    def handle(self, *args, **options):
        if options.get('list_all'):
            users = User.objects.all().order_by('id')
            self.stdout.write(f"Found {users.count()} users:")
            for user in users:
                self.stdout.write(f"ID: {user.id}, Email: {user.email}, Status: {user.status}, Active: {user.is_active}, Email Verified: {user.email_verified}")
            return
        
        user_id = options.get('user_id')
        email = options.get('email')
        
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                self.stdout.write(f"User found:")
                self.stdout.write(f"  ID: {user.id}")
                self.stdout.write(f"  Email: {user.email}")
                self.stdout.write(f"  Name: {user.get_full_name()}")
                self.stdout.write(f"  Status: {user.status}")
                self.stdout.write(f"  Active: {user.is_active}")
                self.stdout.write(f"  Email Verified: {user.email_verified}")
                self.stdout.write(f"  Registration Number: {user.registration_number}")
                self.stdout.write(f"  Phone: {user.phone_number}")
                self.stdout.write(f"  Date Joined: {user.date_joined}")
                self.stdout.write(f"  Last Login: {user.last_login}")
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"User with ID {user_id} not found"))
        
        if email:
            try:
                user = User.objects.get(email=email)
                self.stdout.write(f"User found:")
                self.stdout.write(f"  ID: {user.id}")
                self.stdout.write(f"  Email: {user.email}")
                self.stdout.write(f"  Name: {user.get_full_name()}")
                self.stdout.write(f"  Status: {user.status}")
                self.stdout.write(f"  Active: {user.is_active}")
                self.stdout.write(f"  Email Verified: {user.email_verified}")
                self.stdout.write(f"  Registration Number: {user.registration_number}")
                self.stdout.write(f"  Phone: {user.phone_number}")
                self.stdout.write(f"  Date Joined: {user.date_joined}")
                self.stdout.write(f"  Last Login: {user.last_login}")
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"User with email {email} not found"))
