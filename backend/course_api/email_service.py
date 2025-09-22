from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.urls import reverse
import logging
import os

logger = logging.getLogger(__name__)

# Avoid accessing Django settings at import time to prevent ImproperlyConfigured in tests
if settings.configured:
    # Add detailed logging for email configuration
    logger.info(f"Email backend: {getattr(settings, 'EMAIL_BACKEND', 'Not set')}")
    logger.info(f"Email host: {getattr(settings, 'EMAIL_HOST', 'Not set')}")
    logger.info(f"Email port: {getattr(settings, 'EMAIL_PORT', 'Not set')}")
    logger.info(f"Email host user: {getattr(settings, 'EMAIL_HOST_USER', 'Not set')}")
    logger.info(f"Email host password: {'Set' if getattr(settings, 'EMAIL_HOST_PASSWORD', None) else 'Not set'}")
    logger.info(f"Default from email: {getattr(settings, 'DEFAULT_FROM_EMAIL', 'Not set')}")
    logger.info(f"Frontend URL: {getattr(settings, 'FRONTEND_URL', 'Not set')}")

    # SendGrid configuration
    SENDGRID_API_KEY = getattr(settings, 'SENDGRID_API_KEY', None)
    SENDGRID_FROM_EMAIL = getattr(settings, 'SENDGRID_FROM_EMAIL', 'noreply@riverlearn.co.ke')
else:
    # Safe defaults when settings are not configured (e.g., during import in tests)
    SENDGRID_API_KEY = None
    SENDGRID_FROM_EMAIL = 'noreply@riverlearn.co.ke'

def send_html_email(to_email, subject, template_name, context=None, plain_text_fallback=None):
    """
    Send HTML email using Django templates
    """
    try:
        if context is None:
            context = {}
        
        # Render HTML template
        html_content = render_to_string(template_name, context)
        
        # Create email with both HTML and plain text
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_text_fallback or "Please view this email in an HTML-capable email client.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email]
        )
        
        # Attach HTML version
        email.attach_alternative(html_content, "text/html")
        
        # Send email
        result = email.send(fail_silently=False)
        logger.info(f"HTML email sent successfully to {to_email}, result: {result}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send HTML email to {to_email}: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False


def send_email_via_sendgrid(to_email, subject, message):
    """
    Send email using SendGrid API as fallback when SMTP fails
    """
    if not SENDGRID_API_KEY:
        logger.warning("SendGrid API key not configured, skipping SendGrid email")
        return False
    
    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail
        
        sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
        
        email = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            html_content=f"<pre>{message}</pre>"  # Simple HTML formatting
        )
        
        response = sg.send(email)
        logger.info(f"SendGrid email sent successfully to {to_email}, status: {response.status_code}")
        return True
        
    except ImportError:
        logger.error("SendGrid library not installed")
        return False
    except Exception as e:
        logger.error(f"SendGrid email failed: {str(e)}")
        return False


def send_verification_email(user, verification_token):
    """
    Send email verification email to user
    """
    try:
        logger.info(f"Attempting to send verification email to {user.email}")
        
        # Build verification URL
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        logger.info(f"Verification URL: {verification_url}")
        
        # Email subject
        subject = 'Verify Your Email - RiverLearn'
        
        # Context for HTML template
        context = {
            'user': user,
            'verification_url': verification_url,
            'user_name': user.get_full_name(),
        }
        
        # Plain text fallback
        plain_text = f"""
Hello {user.get_full_name()},

Thank you for registering with RiverLearn Course Organizer!

To complete your registration and verify your email address, please click the link below:

{verification_url}

This link will expire in 24 hours.

If you didn't register for this account, please ignore this email.

Best regards,
The RiverLearn Team
        """.strip()
        
        logger.info(f"Email details - From: {settings.DEFAULT_FROM_EMAIL}, To: {user.email}, Subject: {subject}")
        
        # Send HTML email
        result = send_html_email(
            to_email=user.email,
            subject=subject,
            template_name='emails/email_verification.html',
            context=context,
            plain_text_fallback=plain_text
        )
        
        if result:
            logger.info(f"Verification email sent successfully to {user.email}")
            return True
        else:
            raise Exception("HTML email sending failed")
        
    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        # Try SendGrid as fallback
        logger.warning("SMTP failed, trying SendGrid as fallback...")
        sendgrid_result = send_email_via_sendgrid(user.email, subject, plain_text)
        
        if sendgrid_result:
            logger.info(f"Email sent successfully via SendGrid to {user.email}")
            return True
        
        # Log the email content for manual sending if both SMTP and SendGrid fail
        logger.error("=" * 80)
        logger.error("MANUAL EMAIL SENDING REQUIRED")
        logger.error("=" * 80)
        logger.error(f"To: {user.email}")
        logger.error(f"Subject: {subject}")
        logger.error(f"Message:")
        logger.error(plain_text)
        logger.error("=" * 80)
        
        return False


def send_registration_approval_email(user):
    """
    Send email notification when user registration is approved
    """
    try:
        logger.info(f"Attempting to send approval email to {user.email}")
        
        subject = 'Registration Approved - RiverLearn'
        
        # Build URLs
        login_url = f"{settings.FRONTEND_URL}/login"
        dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
        
        # Include verification link if email not verified yet
        verification_required = False
        verification_url = None
        if not user.email_verified and user.email_verification_token:
            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={user.email_verification_token}"
            verification_required = True
            logger.info(f"User email not verified, including verification link: {verification_url}")
        
        # Context for HTML template
        context = {
            'user': user,
            'user_name': user.get_full_name(),
            'login_url': login_url,
            'dashboard_url': dashboard_url,
            'verification_required': verification_required,
            'verification_url': verification_url,
        }
        
        # Plain text fallback
        verification_section = ""
        if verification_required:
            verification_section = f"""

If you haven't verified your email yet, please click the link below to verify:
{verification_url}
"""
        
        plain_text = f"""
Hello {user.get_full_name()},

Great news! Your registration for RiverLearn Course Organizer has been approved.

You can now log in to your account and access all the features.{verification_section}

Welcome to RiverLearn!

Best regards,
The RiverLearn Team
        """.strip()
        
        logger.info(f"Email details - From: {settings.DEFAULT_FROM_EMAIL}, To: {user.email}, Subject: {subject}")
        
        # Send HTML email
        result = send_html_email(
            to_email=user.email,
            subject=subject,
            template_name='emails/registration_approval.html',
            context=context,
            plain_text_fallback=plain_text
        )
        
        if result:
            logger.info(f"Registration approval email sent successfully to {user.email}")
            return True
        else:
            raise Exception("HTML email sending failed")
        
    except Exception as e:
        logger.error(f"Failed to send approval email to {user.email}: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        # Try SendGrid as fallback
        logger.warning("SMTP failed, trying SendGrid as fallback...")
        sendgrid_result = send_email_via_sendgrid(user.email, subject, plain_text)
        
        if sendgrid_result:
            logger.info(f"Email sent successfully via SendGrid to {user.email}")
            return True
        
        # Log the email content for manual sending if both SMTP and SendGrid fail
        logger.error("=" * 80)
        logger.error("MANUAL EMAIL SENDING REQUIRED")
        logger.error("=" * 80)
        logger.error(f"To: {user.email}")
        logger.error(f"Subject: {subject}")
        logger.error(f"Message:")
        logger.error(plain_text)
        logger.error("=" * 80)
        
        return False


def send_registration_rejection_email(user, reason=None):
    """
    Send email notification when user registration is rejected
    """
    try:
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
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        logger.info(f"Registration rejection email sent to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send rejection email to {user.email}: {str(e)}")
        
        # Try SendGrid as fallback
        logger.warning("SMTP failed, trying SendGrid as fallback...")
        sendgrid_result = send_email_via_sendgrid(user.email, subject, message)
        
        if sendgrid_result:
            logger.info(f"Email sent successfully via SendGrid to {user.email}")
            return True
        
        return False


def send_password_reset_email(user, reset_token):
    """
    Send password reset email to user
    """
    try:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        
        subject = 'Password Reset - RiverLearn'
        
        # Context for HTML template
        context = {
            'user': user,
            'user_name': user.get_full_name(),
            'reset_url': reset_url,
        }
        
        # Plain text fallback
        plain_text = f"""
Hello {user.get_full_name()},

You requested a password reset for your RiverLearn Course Organizer account.

To reset your password, please click the link below:

{reset_url}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

Best regards,
The RiverLearn Team
        """.strip()
        
        # Send HTML email
        result = send_html_email(
            to_email=user.email,
            subject=subject,
            template_name='emails/password_reset.html',
            context=context,
            plain_text_fallback=plain_text
        )
        
        if result:
            logger.info(f"Password reset email sent successfully to {user.email}")
            return True
        else:
            raise Exception("HTML email sending failed")
        
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        # Try SendGrid as fallback
        logger.warning("SMTP failed, trying SendGrid as fallback...")
        sendgrid_result = send_email_via_sendgrid(user.email, subject, plain_text)
        
        if sendgrid_result:
            logger.info(f"Email sent successfully via SendGrid to {user.email}")
            return True
        
        return False


def test_email_connection(test_email=None):
    """
    Test email connection and send a test email
    """
    if not test_email:
        test_email = 'test@example.com'
    
    try:
        logger.info(f"Testing email connection to {test_email}")
        
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
        
        logger.info(f"Test email sent successfully to {test_email}, result: {result}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send test email to {test_email}: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False


def send_announcement_notification_email(user, announcement):
    """
    Send email notification for new announcement
    """
    try:
        context = {
            'user': user,
            'announcement': announcement,
            'site_url': settings.FRONTEND_URL,
            'site_name': 'RiverLearn'
        }
        
        # Determine subject based on priority
        priority_emoji = {
            'low': '📢',
            'normal': '📢',
            'high': '⚠️',
            'urgent': '🚨'
        }
        
        emoji = priority_emoji.get(announcement.priority, '📢')
        subject = f"{emoji} New Announcement: {announcement.title}"
        
        plain_text_fallback = f"""
New Announcement: {announcement.title}

{announcement.content}

From: {announcement.sender.get_full_name()}
Class: {announcement.student_class.display_name}
Posted: {announcement.created_at.strftime('%B %d, %Y at %I:%M %p')}

View all announcements: {settings.FRONTEND_URL}/announcements
        """.strip()
        
        return send_html_email(
            to_email=user.email,
            subject=subject,
            template_name="emails/new_announcement.html",
            context=context,
            plain_text_fallback=plain_text_fallback
        )
        
    except Exception as e:
        logger.error(f"Failed to send announcement notification to {user.email}: {str(e)}")
        return False
