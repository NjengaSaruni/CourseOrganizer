from django.core.management.base import BaseCommand
from course_api.sms_service import sms_service
import os

class Command(BaseCommand):
    help = 'Diagnose SMS service configuration and test connectivity'

    def add_arguments(self, parser):
        parser.add_argument(
            '--phone',
            type=str,
            default='+254795796546',
            help='Phone number to test (default: +254795796546)'
        )

    def handle(self, *args, **options):
        phone_number = options['phone']
        
        self.stdout.write(self.style.SUCCESS('🔍 SMS Service Diagnosis...'))
        self.stdout.write('')
        
        # Check environment variables
        self.stdout.write('📋 Environment Variables:')
        self.stdout.write(f'  TWILIO_ACCOUNT_SID: {os.getenv("TWILIO_ACCOUNT_SID", "NOT SET")[:10]}...')
        self.stdout.write(f'  TWILIO_AUTH_TOKEN: {"SET" if os.getenv("TWILIO_AUTH_TOKEN") else "NOT SET"}')
        self.stdout.write(f'  TWILIO_FROM_NUMBER: {os.getenv("TWILIO_FROM_NUMBER", "NOT SET")}')
        self.stdout.write('')
        
        # Check SMS service configuration
        self.stdout.write('⚙️ SMS Service Configuration:')
        self.stdout.write(f'  Provider: {sms_service.provider}')
        self.stdout.write(f'  Twilio Client: {"Initialized" if sms_service.twilio_client else "Not Initialized"}')
        self.stdout.write(f'  From Number: {sms_service.twilio_from_number}')
        self.stdout.write('')
        
        # Test phone number formatting
        self.stdout.write('📱 Phone Number Processing:')
        clean_number = phone_number.replace(' ', '').replace('-', '')
        if not clean_number.startswith('+'):
            if clean_number.startswith('0'):
                clean_number = '+254' + clean_number[1:]
            elif clean_number.startswith('254'):
                clean_number = '+' + clean_number
            else:
                clean_number = '+254' + clean_number
        
        self.stdout.write(f'  Original: {phone_number}')
        self.stdout.write(f'  Processed: {clean_number}')
        self.stdout.write('')
        
        # Test Twilio connectivity
        if sms_service.twilio_client:
            self.stdout.write('🌐 Testing Twilio Connectivity:')
            try:
                # Try to get account info
                account = sms_service.twilio_client.api.accounts(sms_service.twilio_account_sid).fetch()
                self.stdout.write(f'  Account Status: {account.status}')
                self.stdout.write(f'  Account Type: {account.type}')
                self.stdout.write(f'  Account Name: {account.friendly_name}')
                
                # Check if we can list phone numbers
                phone_numbers = sms_service.twilio_client.incoming_phone_numbers.list(limit=5)
                self.stdout.write(f'  Owned Numbers: {len(phone_numbers)}')
                for num in phone_numbers:
                    self.stdout.write(f'    - {num.phone_number} ({num.friendly_name or "No name"})')
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ❌ Twilio Error: {str(e)}'))
        
        self.stdout.write('')
        self.stdout.write('💡 Troubleshooting Tips:')
        self.stdout.write('1. Verify the phone number in Twilio Console → Phone Numbers → Manage → Verified Caller IDs')
        self.stdout.write('2. Check if your Twilio account is upgraded from trial')
        self.stdout.write('3. Ensure the US number is configured for international SMS')
        self.stdout.write('4. Try with a different phone number format')
