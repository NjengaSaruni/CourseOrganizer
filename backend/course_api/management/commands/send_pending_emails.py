from django.core.management.base import BaseCommand
from directory.models import User
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Send pending emails that failed to send via SMTP'

    def add_arguments(self, parser):
        parser.add_argument('--user-id', type=int, help='User ID to send email to')
        parser.add_argument('--email-type', type=str, choices=['verification', 'approval'], help='Type of email to send')

    def handle(self, *args, **options):
        user_id = options.get('user_id')
        email_type = options.get('email_type')
        
        if not user_id or not email_type:
            self.stdout.write(self.style.ERROR('Please provide --user-id and --email-type'))
            return
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User with ID {user_id} not found'))
            return
        
        # Import email service functions
        from .email_service import send_verification_email, send_registration_approval_email
        
        if email_type == 'verification':
            if not user.email_verification_token:
                self.stdout.write(self.style.ERROR('User does not have a verification token'))
                return
            
            self.stdout.write(f"Sending verification email to {user.email}...")
            result = send_verification_email(user, user.email_verification_token)
            
        elif email_type == 'approval':
            self.stdout.write(f"Sending approval email to {user.email}...")
            result = send_registration_approval_email(user)
        
        if result:
            self.stdout.write(self.style.SUCCESS(f'Email sent successfully to {user.email}'))
        else:
            self.stdout.write(self.style.ERROR(f'Failed to send email to {user.email}'))
            self.stdout.write(self.style.WARNING('Check the logs for manual email content'))
