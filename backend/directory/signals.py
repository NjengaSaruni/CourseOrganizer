"""Signals for tracking user login/logout events"""
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import LoginHistory
from .utils import get_client_ip, parse_user_agent, get_location_from_ip


@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """Log successful user login"""
    if request:
        ip_address = get_client_ip(request)
        user_agent_data = parse_user_agent(request)
        location = get_location_from_ip(ip_address)
        
        LoginHistory.objects.create(
            user=user,
            ip_address=ip_address,
            user_agent=user_agent_data['user_agent'],
            device_type=user_agent_data['device_type'],
            browser=user_agent_data['browser'],
            operating_system=user_agent_data['operating_system'],
            location=location,
            session_key=request.session.session_key if hasattr(request, 'session') else '',
            success=True,
        )


@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    """Update logout time for the last login session"""
    if user and request:
        session_key = request.session.session_key if hasattr(request, 'session') else ''
        
        # Find the most recent active login session for this user
        if session_key:
            # Try to find by session key first
            login_record = LoginHistory.objects.filter(
                user=user,
                session_key=session_key,
                logout_time__isnull=True
            ).first()
        else:
            # Fallback to most recent active session
            login_record = LoginHistory.objects.filter(
                user=user,
                logout_time__isnull=True
            ).order_by('-login_time').first()
        
        if login_record:
            from django.utils import timezone
            login_record.logout_time = timezone.now()
            login_record.save()


@receiver(user_login_failed)
def log_failed_login(sender, credentials, request, **kwargs):
    """Log failed login attempts"""
    if request:
        from .models import User
        ip_address = get_client_ip(request)
        user_agent_data = parse_user_agent(request)
        
        # Try to find the user by email
        username = credentials.get('username', '')
        user = None
        try:
            user = User.objects.filter(email=username).first()
        except:
            pass
        
        # Create failed login record
        LoginHistory.objects.create(
            user=user,  # May be None if user doesn't exist
            ip_address=ip_address,
            user_agent=user_agent_data['user_agent'],
            device_type=user_agent_data['device_type'],
            browser=user_agent_data['browser'],
            operating_system=user_agent_data['operating_system'],
            success=False,
            failure_reason='Invalid credentials',
        )


@receiver(post_save, sender=LoginHistory)
def check_suspicious_activity(sender, instance, created, **kwargs):
    """Check for suspicious login patterns"""
    if created and not instance.success:
        # Count failed attempts from this IP in the last hour
        from django.utils import timezone
        from datetime import timedelta
        
        one_hour_ago = timezone.now() - timedelta(hours=1)
        failed_attempts = LoginHistory.objects.filter(
            ip_address=instance.ip_address,
            success=False,
            login_time__gte=one_hour_ago
        ).count()
        
        # Log warning if too many failed attempts
        if failed_attempts >= 5:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(
                f"Multiple failed login attempts detected from IP {instance.ip_address}. "
                f"Total attempts in last hour: {failed_attempts}"
            )
            # You could send an email alert here or trigger other actions
