import requests
import json
import os
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone


class DailyService:
    """Service class for Daily.co API integration"""
    
    def __init__(self):
        # Get Daily.co API key from environment or settings
        self.api_key = getattr(settings, 'DAILY_API_KEY', os.getenv('DAILY_API_KEY'))
        self.base_url = 'https://api.daily.co/v1'
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def create_room(self, name, properties=None):
        """
        Create a new Daily.co room
        
        Args:
            name (str): Room name (should be unique)
            properties (dict): Room properties like max_participants, enable_recording, etc.
        
        Returns:
            dict: Room creation response
        """
        if not self.api_key:
            raise ValueError("Daily.co API key not configured")
        
        default_properties = {
            'max_participants': 50,
            'enable_recording': 'cloud',
            'enable_prejoin_ui': True,
            'enable_knocking': False,
            'enable_screenshare': True,
            'enable_chat': True,
            'enable_hand_raising': True,
            'enable_network_ui': True,
            'exp': self._get_expiration_timestamp(),
            'properties': {
                'enable_recording_ui': True,
                'enable_screenshare_ui': True,
                'enable_chat_ui': True,
                'enable_hand_raising_ui': True,
                'enable_network_ui': True,
                'enable_people_ui': True,
                'enable_pip_ui': True,
                'enable_video_processing_ui': True,
                'enable_bandwidth_ui': True,
                'enable_advanced_chat': True,
                'enable_noise_cancellation_ui': True,
                'enable_emoji_reactions': True,
                'enable_background_blur': True,
                'enable_virtual_background': True
            }
        }
        
        if properties:
            default_properties.update(properties)
        
        payload = {
            'name': name,
            **default_properties
        }
        
        try:
            response = requests.post(
                f'{self.base_url}/rooms',
                headers=self.headers,
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to create Daily.co room: {str(e)}")
    
    def get_room(self, name):
        """
        Get room information
        
        Args:
            name (str): Room name
        
        Returns:
            dict: Room information
        """
        if not self.api_key:
            raise ValueError("Daily.co API key not configured")
        
        try:
            response = requests.get(
                f'{self.base_url}/rooms/{name}',
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            if e.response and e.response.status_code == 404:
                return None
            raise Exception(f"Failed to get Daily.co room: {str(e)}")
    
    def delete_room(self, name):
        """
        Delete a Daily.co room
        
        Args:
            name (str): Room name
        
        Returns:
            bool: True if successful
        """
        if not self.api_key:
            raise ValueError("Daily.co API key not configured")
        
        try:
            response = requests.delete(
                f'{self.base_url}/rooms/{name}',
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            if e.response and e.response.status_code == 404:
                return True  # Room already deleted
            raise Exception(f"Failed to delete Daily.co room: {str(e)}")
    
    def create_meeting_token(self, room_name, user_id, user_name, is_owner=False):
        """
        Create a meeting token for authentication
        
        Args:
            room_name (str): Room name
            user_id (str): User ID
            user_name (str): User display name
            is_owner (bool): Whether user is room owner
        
        Returns:
            dict: Token creation response
        """
        if not self.api_key:
            raise ValueError("Daily.co API key not configured")
        
        payload = {
            'properties': {
                'room_name': room_name,
                'user_id': user_id,
                'is_owner': is_owner,
                'exp': self._get_expiration_timestamp(),
                'user_name': user_name
            }
        }
        
        try:
            response = requests.post(
                f'{self.base_url}/meeting-tokens',
                headers=self.headers,
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to create meeting token: {str(e)}")
    
    def get_room_participants(self, room_name):
        """
        Get current participants in a room
        
        Args:
            room_name (str): Room name
        
        Returns:
            list: List of participants
        """
        if not self.api_key:
            raise ValueError("Daily.co API key not configured")
        
        try:
            response = requests.get(
                f'{self.base_url}/rooms/{room_name}/participants',
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get room participants: {str(e)}")
    
    def end_room_session(self, room_name):
        """
        End all active sessions in a room
        
        Args:
            room_name (str): Room name
        
        Returns:
            bool: True if successful
        """
        if not self.api_key:
            raise ValueError("Daily.co API key not configured")
        
        try:
            response = requests.post(
                f'{self.base_url}/rooms/{room_name}/end-session',
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to end room session: {str(e)}")
    
    def _get_expiration_timestamp(self):
        """Get expiration timestamp (24 hours from now)"""
        return int((datetime.now() + timedelta(hours=24)).timestamp())
    
    def generate_room_name(self, course_code, day, time):
        """
        Generate a unique room name based on course and schedule
        
        Args:
            course_code (str): Course code
            day (str): Day of week
            time (str): Time slot
        
        Returns:
            str: Generated room name
        """
        # Clean and format the inputs
        clean_course = course_code.lower().replace(' ', '').replace('-', '')
        clean_day = day.lower()
        clean_time = time.replace(':', '').replace(' ', '').replace('-', '')
        
        # Daily.co room names must be lowercase, alphanumeric, and hyphens only
        room_name = f"{clean_course}-{clean_day}-{clean_time}"
        
        # Ensure it's not too long (Daily.co limit is 50 chars)
        if len(room_name) > 50:
            room_name = room_name[:50]
        
        return room_name
    
    def is_api_configured(self):
        """Check if Daily.co API is properly configured"""
        return bool(self.api_key)


# Global instance
daily_service = DailyService()
