from django.core.management.base import BaseCommand
from django.conf import settings
import smtplib
import ssl
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Test SMTP connection directly'

    def add_arguments(self, parser):
        parser.add_argument('--test-email', type=str, help='Email address to test with', default='test@example.com')

    def handle(self, *args, **options):
        test_email = options['test_email']
        
        self.stdout.write(self.style.SUCCESS('Testing SMTP Connection...'))
        
        # Display current settings
        self.stdout.write(f"Email backend: {settings.EMAIL_BACKEND}")
        self.stdout.write(f"Email host: {getattr(settings, 'EMAIL_HOST', 'Not set')}")
        self.stdout.write(f"Email port: {getattr(settings, 'EMAIL_PORT', 'Not set')}")
        self.stdout.write(f"Email use TLS: {getattr(settings, 'EMAIL_USE_TLS', 'Not set')}")
        self.stdout.write(f"Email use SSL: {getattr(settings, 'EMAIL_USE_SSL', 'Not set')}")
        self.stdout.write(f"Email host user: {getattr(settings, 'EMAIL_HOST_USER', 'Not set')}")
        self.stdout.write(f"Email host password: {'Set' if getattr(settings, 'EMAIL_HOST_PASSWORD', None) else 'Not set'}")
        self.stdout.write(f"Email timeout: {getattr(settings, 'EMAIL_TIMEOUT', 'Not set')}")
        
        # Test direct SMTP connection
        try:
            self.stdout.write("Attempting direct SMTP connection...")
            
            # Create SMTP connection
            smtp_server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=30)
            
            # Enable debug output
            smtp_server.set_debuglevel(1)
            
            # Start TLS if required
            if settings.EMAIL_USE_TLS:
                self.stdout.write("Starting TLS...")
                context = ssl.create_default_context()
                smtp_server.starttls(context=context)
            
            # Login
            self.stdout.write("Attempting to login...")
            smtp_server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            
            self.stdout.write(self.style.SUCCESS("SMTP connection successful!"))
            
            # Send test email
            self.stdout.write("Sending test email...")
            message = f"""Subject: Test Email from Course Organizer

This is a test email to verify SMTP functionality.

If you receive this, the email system is working correctly.

Best regards,
Course Organizer Team"""
            
            smtp_server.sendmail(
                settings.EMAIL_HOST_USER,
                test_email,
                message
            )
            
            self.stdout.write(self.style.SUCCESS(f"Test email sent successfully to {test_email}!"))
            
            # Close connection
            smtp_server.quit()
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"SMTP connection failed: {str(e)}"))
            self.stdout.write(self.style.ERROR(f"Exception type: {type(e).__name__}"))
            import traceback
            self.stdout.write(self.style.ERROR(f"Traceback: {traceback.format_exc()}"))
