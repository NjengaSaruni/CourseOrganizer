"""
SMS Service for Course Organizer
Handles sending passcodes and notifications via SMS
"""

import os
import logging
from typing import Optional
from twilio.rest import Client
from twilio.base.exceptions import TwilioException

logger = logging.getLogger(__name__)

class SMSService:
    """SMS service using Twilio"""
    
    def __init__(self):
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.from_number = os.getenv('TWILIO_FROM_NUMBER')
        
        # Initialize Twilio client if credentials are available
        self.client = None
        if self.account_sid and self.auth_token:
            try:
                self.client = Client(self.account_sid, self.auth_token)
                logger.info("Twilio SMS service initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {e}")
        else:
            logger.warning("Twilio credentials not found. SMS will be logged only.")
    
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
        Internal method to send SMS
        
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
        
        # Send via Twilio if client is available
        if self.client and self.from_number:
            try:
                message_obj = self.client.messages.create(
                    body=message,
                    from_=self.from_number,
                    to=clean_number
                )
                
                return {
                    'success': True,
                    'message': f'SMS sent successfully to {clean_number}',
                    'twilio_sid': message_obj.sid,
                    'status': message_obj.status
                }
                
            except TwilioException as e:
                error_msg = f"Twilio error: {str(e)}"
                logger.error(error_msg)
                return {
                    'success': False,
                    'message': error_msg,
                    'fallback': True
                }
        else:
            # Fallback: just log the SMS
            return {
                'success': True,
                'message': f'SMS logged (no Twilio credentials): {clean_number}',
                'fallback': True
            }

# Global SMS service instance
sms_service = SMSService()
