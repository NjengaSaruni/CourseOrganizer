from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Test email functionality'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Email address to send test email to')
        parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')

    def handle(self, *args, **options):
        test_email = options.get('email', 'gpr31505612025@students.uonbi.ac.ke')
        verbose = options.get('verbose', False)
        
        if verbose:
            # Set logging level to DEBUG
            logging.getLogger().setLevel(logging.DEBUG)
        
        self.stdout.write(f"Testing email functionality...")
        self.stdout.write(f"Email backend: {settings.EMAIL_BACKEND}")
        self.stdout.write(f"Email host: {getattr(settings, 'EMAIL_HOST', 'Not set')}")
        self.stdout.write(f"Email port: {getattr(settings, 'EMAIL_PORT', 'Not set')}")
        self.stdout.write(f"Email host user: {getattr(settings, 'EMAIL_HOST_USER', 'Not set')}")
        self.stdout.write(f"Email host password: {'Set' if getattr(settings, 'EMAIL_HOST_PASSWORD', None) else 'Not set'}")
        self.stdout.write(f"Default from email: {getattr(settings, 'DEFAULT_FROM_EMAIL', 'Not set')}")
        self.stdout.write(f"Frontend URL: {getattr(settings, 'FRONTEND_URL', 'Not set')}")
        
        try:
            self.stdout.write(f"Sending test email to {test_email}...")
            
            result = send_mail(
                subject='Test Email - Course Organizer',
                message=f"""
Hello,

This is a test email from Course Organizer to verify email functionality.

If you receive this email, the email system is working correctly.

Best regards,
Course Organizer Team
                """.strip(),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[test_email],
                fail_silently=False,
            )
            
            self.stdout.write(self.style.SUCCESS(f"Test email sent successfully! Result: {result}"))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to send test email: {str(e)}"))
            self.stdout.write(f"Exception type: {type(e).__name__}")
            import traceback
            self.stdout.write(f"Traceback: {traceback.format_exc()}")
