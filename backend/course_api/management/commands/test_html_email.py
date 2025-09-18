from django.core.management.base import BaseCommand
from course_api.email_service import send_html_email
from django.contrib.auth import get_user_model
from course_api.models import AcademicYear

User = get_user_model()


class Command(BaseCommand):
    help = 'Test HTML email templates by sending a sample email'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            required=True,
            help='Email address to send test email to'
        )
        parser.add_argument(
            '--template',
            type=str,
            choices=['verification', 'approval', 'rejection', 'reset', 'welcome'],
            default='verification',
            help='Email template to test'
        )

    def handle(self, *args, **options):
        email = options['email']
        template_type = options['template']
        
        # Create a sample user for testing
        academic_year = AcademicYear.get_or_create_2025_2026()
        
        sample_user = User(
            email=email,
            first_name='John',
            last_name='Doe',
            registration_number='GPR3/123456/2025',
            phone_number='+254700000000',
            status='approved',
            is_active=True,
            current_year=1,
            current_semester=1,
            class_of=2029,
            academic_year=academic_year,
            user_type='student',
            email_verified=False,
            email_verification_token='sample_verification_token_12345'
        )
        
        # Sample URLs
        verification_url = 'https://co.riverlearn.co.ke/verify-email?token=sample_verification_token_12345'
        login_url = 'https://co.riverlearn.co.ke/login'
        dashboard_url = 'https://co.riverlearn.co.ke/dashboard'
        reset_url = 'https://co.riverlearn.co.ke/reset-password?token=sample_reset_token_12345'
        
        # Template configurations
        templates = {
            'verification': {
                'subject': 'Test: Email Verification - RiverLearn',
                'template': 'emails/email_verification.html',
                'context': {
                    'user': sample_user,
                    'verification_url': verification_url,
                    'user_name': sample_user.get_full_name(),
                }
            },
            'approval': {
                'subject': 'Test: Registration Approved - RiverLearn',
                'template': 'emails/registration_approval.html',
                'context': {
                    'user': sample_user,
                    'user_name': sample_user.get_full_name(),
                    'login_url': login_url,
                    'dashboard_url': dashboard_url,
                    'verification_required': True,
                    'verification_url': verification_url,
                }
            },
            'rejection': {
                'subject': 'Test: Registration Update - RiverLearn',
                'template': 'emails/registration_rejection.html',
                'context': {
                    'user': sample_user,
                    'user_name': sample_user.get_full_name(),
                    'reason': 'Incomplete registration information provided.',
                }
            },
            'reset': {
                'subject': 'Test: Password Reset - RiverLearn',
                'template': 'emails/password_reset.html',
                'context': {
                    'user': sample_user,
                    'user_name': sample_user.get_full_name(),
                    'reset_url': reset_url,
                }
            },
            'welcome': {
                'subject': 'Test: Welcome to RiverLearn!',
                'template': 'emails/welcome.html',
                'context': {
                    'user': sample_user,
                    'user_name': sample_user.get_full_name(),
                    'dashboard_url': dashboard_url,
                }
            }
        }
        
        template_config = templates[template_type]
        
        self.stdout.write(f"Sending test {template_type} email to {email}...")
        
        try:
            result = send_html_email(
                to_email=email,
                subject=template_config['subject'],
                template_name=template_config['template'],
                context=template_config['context'],
                plain_text_fallback=f"Test {template_type} email from RiverLearn"
            )
            
            if result:
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Test {template_type} email sent successfully to {email}")
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f"❌ Failed to send test {template_type} email to {email}")
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error sending test email: {str(e)}")
            )
