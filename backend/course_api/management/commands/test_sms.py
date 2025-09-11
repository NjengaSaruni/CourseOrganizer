from django.core.management.base import BaseCommand
from course_api.sms_service import sms_service


class Command(BaseCommand):
    help = 'Test SMS service functionality'

    def add_arguments(self, parser):
        parser.add_argument(
            '--phone',
            type=str,
            default='+254700000000',
            help='Phone number to send test SMS to (default: +254700000000)'
        )
        parser.add_argument(
            '--type',
            type=str,
            choices=['passcode', 'approval'],
            default='passcode',
            help='Type of SMS to send (default: passcode)'
        )

    def handle(self, *args, **options):
        phone_number = options['phone']
        sms_type = options['type']
        
        self.stdout.write(self.style.SUCCESS('📱 Testing SMS Service...'))
        self.stdout.write(f'Phone: {phone_number}')
        self.stdout.write(f'Type: {sms_type}')
        self.stdout.write('')
        
        if sms_type == 'passcode':
            result = sms_service.send_passcode(
                phone_number=phone_number,
                passcode='123456',
                student_name='Test Student'
            )
        else:
            result = sms_service.send_approval_notification(
                phone_number=phone_number,
                student_name='Test Student'
            )
        
        if result['success']:
            self.stdout.write(self.style.SUCCESS('✅ SMS sent successfully!'))
            self.stdout.write(f'Message: {result["message"]}')
            if result.get('twilio_sid'):
                self.stdout.write(f'Twilio SID: {result["twilio_sid"]}')
            if result.get('fallback'):
                self.stdout.write(self.style.WARNING('⚠️  SMS was logged only (no Twilio credentials)'))
        else:
            self.stdout.write(self.style.ERROR('❌ SMS failed!'))
            self.stdout.write(f'Error: {result["message"]}')
        
        self.stdout.write('')
        self.stdout.write('To set up Twilio for real SMS:')
        self.stdout.write('1. Sign up at https://twilio.com')
        self.stdout.write('2. Get your Account SID and Auth Token')
        self.stdout.write('3. Get a phone number from Twilio')
        self.stdout.write('4. Set environment variables:')
        self.stdout.write('   TWILIO_ACCOUNT_SID=your_account_sid')
        self.stdout.write('   TWILIO_AUTH_TOKEN=your_auth_token')
        self.stdout.write('   TWILIO_FROM_NUMBER=your_twilio_number')
