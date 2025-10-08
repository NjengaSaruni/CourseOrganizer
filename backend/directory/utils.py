"""Utility functions for directory app"""
from user_agents import parse


def get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def parse_user_agent(request):
    """Parse user agent string and extract device info"""
    user_agent_string = request.META.get('HTTP_USER_AGENT', '')
    user_agent = parse(user_agent_string)
    
    # Determine device type
    if user_agent.is_mobile:
        device_type = 'Mobile'
    elif user_agent.is_tablet:
        device_type = 'Tablet'
    elif user_agent.is_pc:
        device_type = 'Desktop'
    else:
        device_type = 'Other'
    
    # Get browser and OS
    browser = f"{user_agent.browser.family} {user_agent.browser.version_string}"
    operating_system = f"{user_agent.os.family} {user_agent.os.version_string}"
    
    return {
        'user_agent': user_agent_string,
        'device_type': device_type,
        'browser': browser,
        'operating_system': operating_system,
    }


def get_location_from_ip(ip_address):
    """Get location from IP address (optional, requires external API)"""
    # This is a placeholder - you can implement with ipapi.co or similar
    # For now, we'll return empty string
    # Example implementation:
    # import requests
    # try:
    #     response = requests.get(f'https://ipapi.co/{ip_address}/json/')
    #     if response.status_code == 200:
    #         data = response.json()
    #         return f"{data.get('city', '')}, {data.get('country_name', '')}"
    # except:
    #     pass
    return ""

