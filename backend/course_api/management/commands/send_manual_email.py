from django.core.management.base import BaseCommand
from directory.models import User
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Manually send emails when SMTP fails'

    def add_arguments(self, parser):
        parser.add_argument('--user-id', type=int, help='User ID to send email to')
        parser.add_argument('--email-type', type=str, choices=['verification', 'approval', 'rejection'], help='Type of email to send')
        parser.add_argument('--reason', type=str, help='Reason for rejection (if email-type is rejection)')

    def handle(self, *args, **options):
        user_id = options.get('user_id')
        email_type = options.get('email_type')
        reason = options.get('reason')
        
        if not user_id or not email_type:
            self.stdout.write(self.style.ERROR('Please provide --user-id and --email-type'))
            return
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User with ID {user_id} not found'))
            return
        
        if email_type == 'verification':
            if not user.email_verification_token:
                self.stdout.write(self.style.ERROR('User does not have a verification token'))
                return
            
            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={user.email_verification_token}"
            
            subject = 'Verify Your Email - Course Organizer'
            message = f"""
Hello {user.get_full_name()},

Thank you for registering with Course Organizer!

To complete your registration and verify your email address, please click the link below:

{verification_url}

This link will expire in 24 hours.

If you didn't register for this account, please ignore this email.

Best regards,
Course Organizer Team
University of Nairobi Law School
            """.strip()
            
        elif email_type == 'approval':
            # Include verification link if email not verified yet
            verification_section = ""
            if not user.email_verified and user.email_verification_token:
                verification_url = f"{settings.FRONTEND_URL}/verify-email?token={user.email_verification_token}"
                verification_section = f"""

If you haven't verified your email yet, please click the link below to verify:
{verification_url}
"""
            
            subject = 'Registration Approved - Course Organizer'
            message = f"""
Hello {user.get_full_name()},

Great news! Your registration for Course Organizer has been approved.

You can now log in to your account and access all the features.{verification_section}

Welcome to Course Organizer!

Best regards,
Course Organizer Team
University of Nairobi Law School
            """.strip()
            
        elif email_type == 'rejection':
            subject = 'Registration Update - Course Organizer'
            message = f"""
Hello {user.get_full_name()},

We regret to inform you that your registration for Course Organizer could not be approved at this time.
            """
            
            if reason:
                message += f"\n\nReason: {reason}"
            
            message += """

If you believe this is an error or would like to appeal this decision, please contact the administration.

Thank you for your interest in Course Organizer.

Best regards,
Course Organizer Team
University of Nairobi Law School
            """.strip()
        
        # Display the email content
        self.stdout.write(self.style.SUCCESS("=" * 80))
        self.stdout.write(self.style.SUCCESS("MANUAL EMAIL TO SEND"))
        self.stdout.write(self.style.SUCCESS("=" * 80))
        self.stdout.write(f"To: {user.email}")
        self.stdout.write(f"Subject: {subject}")
        self.stdout.write(f"Message:")
        self.stdout.write(message)
        self.stdout.write(self.style.SUCCESS("=" * 80))
        
        # Log it as well
        logger.info("=" * 80)
        logger.info("MANUAL EMAIL TO SEND")
        logger.info("=" * 80)
        logger.info(f"To: {user.email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Message:")
        logger.info(message)
        logger.info("=" * 80)
