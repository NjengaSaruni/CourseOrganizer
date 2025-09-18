from django.core.management.base import BaseCommand
from django.template.loader import render_to_string
from django.contrib.auth import get_user_model
from course_api.models import AcademicYear
import os

User = get_user_model()


class Command(BaseCommand):
    help = 'Preview email templates by generating HTML files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output-dir',
            type=str,
            default='email_previews',
            help='Directory to save HTML preview files'
        )

    def handle(self, *args, **options):
        output_dir = options['output_dir']
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Create a sample user for preview
        academic_year = AcademicYear.get_or_create_2025_2026()
        
        sample_user = User(
            email='john.doe@example.com',
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
        
        # Email templates to preview
        templates = [
            {
                'name': 'email_verification',
                'template': 'emails/email_verification.html',
                'context': {
                    'user': sample_user,
                    'verification_url': verification_url,
                    'user_name': sample_user.get_full_name(),
                }
            },
            {
                'name': 'registration_approval',
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
            {
                'name': 'registration_rejection',
                'template': 'emails/registration_rejection.html',
                'context': {
                    'user': sample_user,
                    'user_name': sample_user.get_full_name(),
                    'reason': 'Incomplete registration information provided.',
                }
            },
            {
                'name': 'password_reset',
                'template': 'emails/password_reset.html',
                'context': {
                    'user': sample_user,
                    'user_name': sample_user.get_full_name(),
                    'reset_url': reset_url,
                }
            },
            {
                'name': 'welcome',
                'template': 'emails/welcome.html',
                'context': {
                    'user': sample_user,
                    'user_name': sample_user.get_full_name(),
                    'dashboard_url': dashboard_url,
                }
            }
        ]
        
        # Generate preview files
        for template_info in templates:
            try:
                html_content = render_to_string(template_info['template'], template_info['context'])
                
                output_file = os.path.join(output_dir, f"{template_info['name']}.html")
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(html_content)
                
                self.stdout.write(
                    self.style.SUCCESS(f"Generated preview: {output_file}")
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Failed to generate {template_info['name']}: {str(e)}")
                )
        
        # Create index file
        index_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template Previews - RiverLearn</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #f5f5f7;
        }
        h1 {
            color: #1d1d1f;
            text-align: center;
            margin-bottom: 40px;
        }
        .template-list {
            list-style: none;
            padding: 0;
        }
        .template-list li {
            margin-bottom: 15px;
        }
        .template-list a {
            display: block;
            padding: 15px 20px;
            background: white;
            border-radius: 12px;
            text-decoration: none;
            color: #1d1d1f;
            font-weight: 500;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        .template-list a:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .description {
            color: #86868b;
            font-size: 14px;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <h1>📧 RiverLearn Email Template Previews</h1>
    <ul class="template-list">
        <li>
            <a href="email_verification.html">
                Email Verification
                <div class="description">Sent when users need to verify their email address</div>
            </a>
        </li>
        <li>
            <a href="registration_approval.html">
                Registration Approval
                <div class="description">Sent when user registration is approved by admin</div>
            </a>
        </li>
        <li>
            <a href="registration_rejection.html">
                Registration Rejection
                <div class="description">Sent when user registration is rejected</div>
            </a>
        </li>
        <li>
            <a href="password_reset.html">
                Password Reset
                <div class="description">Sent when users request a password reset</div>
            </a>
        </li>
        <li>
            <a href="welcome.html">
                Welcome Email
                <div class="description">Welcome message for new users</div>
            </a>
        </li>
    </ul>
</body>
</html>
        """
        
        index_file = os.path.join(output_dir, 'index.html')
        with open(index_file, 'w', encoding='utf-8') as f:
            f.write(index_content)
        
        self.stdout.write(
            self.style.SUCCESS(f"\n🎉 Email previews generated successfully!")
        )
        self.stdout.write(
            self.style.SUCCESS(f"📁 Output directory: {output_dir}")
        )
        self.stdout.write(
            self.style.SUCCESS(f"🌐 Open {index_file} in your browser to view all templates")
        )
