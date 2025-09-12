"""
SMS Service for Course Organizer
Handles sending passcodes and notifications via SMS
Supports multiple SMS providers: Twilio, Africa's Talking, and logging fallback
"""

import os
import logging
import requests
from typing import Optional
from twilio.rest import Client
from twilio.base.exceptions import TwilioException

logger = logging.getLogger(__name__)

class SMSService:
    """SMS service supporting multiple providers"""
    
    def __init__(self):
        # Twilio configuration
        self.twilio_account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.twilio_auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.twilio_from_number = os.getenv('TWILIO_FROM_NUMBER')
        
        # Africa's Talking configuration
        self.at_username = os.getenv('AT_USERNAME')
        self.at_api_key = os.getenv('AT_API_KEY')
        self.at_from = os.getenv('AT_FROM', 'CourseOrg')
        
        # Initialize providers
        self.twilio_client = None
        self.provider = self._initialize_providers()
        
    def _initialize_providers(self):
        """Initialize available SMS providers"""
        # Try Twilio first
        if self.twilio_account_sid and self.twilio_auth_token and self.twilio_from_number:
            try:
                self.twilio_client = Client(self.twilio_account_sid, self.twilio_auth_token)
                logger.info("Twilio SMS service initialized successfully")
                return 'twilio'
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {e}")
        
        # Try Africa's Talking
        if self.at_username and self.at_api_key:
            logger.info("Africa's Talking SMS service initialized successfully")
            return 'africas_talking'
        
        # Fallback to logging
        logger.warning("No SMS provider credentials found. SMS will be logged only.")
        return 'logging'
    
    def send_passcode(self, phone_number: str, passcode: str, student_name: str) -> dict:
        """
        Send passcode via SMS
        
        Args:
            phone_number: Student's phone number
            passcode: Generated passcode
            student_name: Student's name for personalization
            
        Returns:
            dict: Result with success status and message
        """
        message = f"Hello {student_name}! Your Course Organizer passcode is: {passcode}. Use this to complete your registration at the University of Nairobi Law School."
        
        return self._send_sms(phone_number, message, "passcode")
    
    def send_approval_notification(self, phone_number: str, student_name: str) -> dict:
        """
        Send registration approval notification
        
        Args:
            phone_number: Student's phone number
            student_name: Student's name
            
        Returns:
            dict: Result with success status and message
        """
        message = f"Congratulations {student_name}! Your registration for University of Nairobi Law School has been approved. You can now access your student portal."
        
        return self._send_sms(phone_number, message, "approval")
    
    def _send_sms(self, phone_number: str, message: str, sms_type: str) -> dict:
        """
        Internal method to send SMS using the best available provider
        
        Args:
            phone_number: Recipient's phone number
            message: SMS message content
            sms_type: Type of SMS (for logging)
            
        Returns:
            dict: Result with success status and message
        """
        # Clean phone number (remove spaces, add + if needed)
        clean_number = phone_number.replace(' ', '').replace('-', '')
        if not clean_number.startswith('+'):
            # Assume Kenya number if no country code
            if clean_number.startswith('0'):
                clean_number = '+254' + clean_number[1:]
            elif clean_number.startswith('254'):
                clean_number = '+' + clean_number
            else:
                clean_number = '+254' + clean_number
        
        # Log the SMS (always)
        logger.info(f"SMS ({sms_type}) to {clean_number}: {message}")
        print(f"📱 SMS ({sms_type}) to {clean_number}: {message}")
        
        # Send via the best available provider
        if self.provider == 'twilio':
            return self._send_via_twilio(clean_number, message, sms_type)
        elif self.provider == 'africas_talking':
            return self._send_via_africas_talking(clean_number, message, sms_type)
        else:
            # Fallback: just log the SMS
            return {
                'success': True,
                'message': f'SMS logged (no provider credentials): {clean_number}',
                'fallback': True,
                'provider': 'logging'
            }
    
    def _send_via_twilio(self, phone_number: str, message: str, sms_type: str) -> dict:
        """Send SMS via Twilio"""
        try:
            message_obj = self.twilio_client.messages.create(
                body=message,
                from_=self.twilio_from_number,
                to=phone_number
            )
            
            return {
                'success': True,
                'message': f'SMS sent successfully to {phone_number}',
                'provider': 'twilio',
                'twilio_sid': message_obj.sid,
                'status': message_obj.status
            }
            
        except TwilioException as e:
            error_msg = f"Twilio error: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'message': error_msg,
                'provider': 'twilio',
                'fallback': True
            }
    
    def _send_via_africas_talking(self, phone_number: str, message: str, sms_type: str) -> dict:
        """Send SMS via Africa's Talking"""
        try:
            url = "https://api.africastalking.com/version1/messaging"
            headers = {
                'ApiKey': self.at_api_key,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            data = {
                'username': self.at_username,
                'to': phone_number,
                'message': message,
                'from': self.at_from
            }
            
            response = requests.post(url, headers=headers, data=data)
            response.raise_for_status()
            
            result = response.json()
            if result.get('SMSMessageData', {}).get('Recipients', [{}])[0].get('status') == 'Success':
                return {
                    'success': True,
                    'message': f'SMS sent successfully to {phone_number}',
                    'provider': 'africas_talking',
                    'at_response': result
                }
            else:
                return {
                    'success': False,
                    'message': f"Africa's Talking error: {result}",
                    'provider': 'africas_talking'
                }
                
        except Exception as e:
            error_msg = f"Africa's Talking error: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'message': error_msg,
                'provider': 'africas_talking'
            }

# Global SMS service instance
sms_service = SMSService()
