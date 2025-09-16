"""
Jitsi Meet JWT Authentication Module
Handles JWT token generation for secure Jitsi Meet integration
"""

import jwt
import time
import hashlib
import hmac
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth.models import User
from typing import Dict, Any, Optional
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend


class JitsiJWTAuth:
    """JWT authentication for Jitsi Meet"""
    
    def __init__(self):
        # Jitsi Meet JWT configuration
        self.app_id = getattr(settings, 'JITSI_APP_ID', 'course-organizer')
        self.app_secret = getattr(settings, 'JITSI_APP_SECRET', 'your-jitsi-app-secret')
        self.issuer = getattr(settings, 'JITSI_ISSUER', 'course-organizer')
        self.audience = getattr(settings, 'JITSI_AUDIENCE', 'jitsi')
        self.algorithm = 'RS256'  # Use RSA instead of HMAC
        
        # Load RSA keys
        self.private_key = self._load_private_key()
        self.public_key = self._load_public_key()
    
    def _load_private_key(self):
        """Load RSA private key from settings or generate one"""
        private_key_pem = getattr(settings, 'JITSI_PRIVATE_KEY', None)
        if private_key_pem:
            return serialization.load_pem_private_key(
                private_key_pem.encode(),
                password=None,
                backend=default_backend()
            )
        else:
            # Generate a new key pair for testing
            return rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048,
                backend=default_backend()
            )
    
    def _load_public_key(self):
        """Load RSA public key from settings or generate one"""
        public_key_pem = getattr(settings, 'JITSI_PUBLIC_KEY', None)
        if public_key_pem:
            return serialization.load_pem_public_key(
                public_key_pem.encode(),
                backend=default_backend()
            )
        else:
            # Use the public key from the private key
            return self.private_key.public_key()
        
    def generate_token(self, user: User, room_name: str, 
                      moderator: bool = False, 
                      display_name: Optional[str] = None,
                      avatar_url: Optional[str] = None) -> str:
        """
        Generate JWT token for Jitsi Meet authentication
        
        Args:
            user: Django User object
            room_name: Jitsi room name
            moderator: Whether user is a moderator
            display_name: User's display name
            avatar_url: User's avatar URL
            
        Returns:
            JWT token string
        """
        now = datetime.utcnow()
        
        # Token payload
        payload = {
            'iss': self.issuer,
            'aud': self.audience,
            'sub': self.app_id,
            'room': room_name,
            'exp': now + timedelta(hours=24),  # Token expires in 24 hours
            'iat': now,
            'nbf': now,
            'context': {
                'user': {
                    'id': str(user.id),
                    'name': display_name or f"{user.first_name} {user.last_name}".strip() or user.username,
                    'email': user.email,
                    'avatar': avatar_url or '',
                    'moderator': moderator
                },
                'features': {
                    'livestreaming': moderator,
                    'recording': moderator,
                    'transcription': True,
                    'outbound-call': False,
                    'sip-inbound-call': False
                }
            }
        }
        
        # Generate JWT token with RSA and kid claim
        headers = {
            'kid': self.app_id  # Key ID for RSA
        }
        token = jwt.encode(payload, self.private_key, algorithm=self.algorithm, headers=headers)
        return token
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verify JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token payload
            
        Raises:
            jwt.InvalidTokenError: If token is invalid
        """
        try:
            payload = jwt.decode(
                token, 
                self.public_key, 
                algorithms=[self.algorithm],
                audience=self.audience,
                issuer=self.issuer
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise jwt.InvalidTokenError("Token has expired")
        except jwt.InvalidAudienceError:
            raise jwt.InvalidTokenError("Invalid audience")
        except jwt.InvalidIssuerError:
            raise jwt.InvalidTokenError("Invalid issuer")
        except jwt.InvalidTokenError as e:
            raise jwt.InvalidTokenError(f"Invalid token: {str(e)}")
    
    def generate_room_url(self, room_name: str, token: str, 
                         domain: Optional[str] = None) -> str:
        """
        Generate authenticated Jitsi room URL
        
        Args:
            room_name: Room name
            token: JWT token
            domain: Jitsi domain (optional, uses settings if not provided)
            
        Returns:
            Complete Jitsi room URL with authentication
        """
        # Use domain from settings if not provided
        if domain is None:
            domain = getattr(settings, 'JITSI_DOMAIN', 'meet.jit.si')
        
        # Clean room name (remove special characters)
        clean_room_name = ''.join(c for c in room_name if c.isalnum() or c in '-_')
        
        # Generate URL with JWT token
        url = f"https://{domain}/{clean_room_name}?jwt={token}"
        return url
    
    def is_user_moderator(self, user: User, meeting_id: Optional[int] = None) -> bool:
        """
        Check if user should be a moderator for the meeting
        
        Args:
            user: Django User object
            meeting_id: Meeting ID (optional)
            
        Returns:
            True if user should be moderator
        """
        # Admin users are always moderators
        if user.is_staff or user.is_superuser:
            return True
            
        # Check if user is the meeting creator
        if meeting_id:
            from .models import Meeting
            try:
                meeting = Meeting.objects.get(id=meeting_id)
                return meeting.created_by == user
            except Meeting.DoesNotExist:
                pass
                
        return False


# Global instance
jitsi_auth = JitsiJWTAuth()
