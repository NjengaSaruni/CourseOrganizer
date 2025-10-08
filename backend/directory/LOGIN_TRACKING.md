# Login Tracking System

## Overview
Comprehensive login tracking system for monitoring user authentication activities, analyzing usage patterns, and detecting security threats.

## Features Implemented

### 1. LoginHistory Model
Tracks all login and logout events with the following information:
- User account
- Login/logout timestamps
- IP address
- User agent details (browser, device type, OS)
- Session duration
- Success/failure status
- Failure reasons
- Geographic location (placeholder for future API integration)

### 2. Automatic Tracking via Django Signals
- **Successful Logins**: Automatically logged when users authenticate
- **Failed Logins**: Tracks invalid credentials attempts with user email
- **Logouts**: Updates session with logout time
- **Security Alerts**: Automatically logs warnings after 5+ failed attempts from same IP within 1 hour

### 3. Admin Interface
Access the admin panel at `/admin/directory/loginhistory/` with the following features:

#### List View Features:
- Filter by success/failure, device type, login time, user type
- Search by user email, name, IP address, browser, OS
- Display session status (Active/Ended)
- Session duration calculation
- Read-only to prevent tampering

#### Statistics Dashboard:
- **Overview**: Total logins, successful/failed counts, active sessions
- **Today's Stats**: Login counts, unique users
- **Weekly Stats**: Last 7 days activity
- **Most Active Users**: Top 5 users by login count
- **Suspicious IPs**: Failed attempts (≥3 in 24h)

### 4. REST API Endpoint

#### GET `/api/directory/auth/login-stats/`
**Permission**: Admin only

**Response Structure**:
```json
{
  "overview": {
    "total_logins": 150,
    "successful_logins": 145,
    "failed_logins": 5,
    "active_sessions": 12
  },
  "today": {
    "total": 25,
    "successful": 24,
    "failed": 1,
    "unique_users": 15
  },
  "week": {
    "total": 120,
    "successful": 115,
    "unique_users": 45
  },
  "month": {
    "total": 300
  },
  "most_active_users": [
    {
      "user__id": 1,
      "user__email": "user@example.com",
      "user__first_name": "John",
      "user__last_name": "Doe",
      "user__user_type": "student",
      "login_count": 25
    }
  ],
  "device_breakdown": [
    {"device_type": "Mobile", "count": 80},
    {"device_type": "Desktop", "count": 65}
  ],
  "browser_breakdown": [
    {"browser": "Chrome 120.0", "count": 90}
  ],
  "suspicious_ips": [
    {"ip_address": "192.168.1.100", "attempt_count": 5}
  ],
  "recent_logins": [
    {
      "id": 123,
      "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe",
        "user_type": "student"
      },
      "login_time": "2025-10-08T12:30:00Z",
      "ip_address": "192.168.1.1",
      "device_type": "Desktop",
      "browser": "Chrome 120.0",
      "is_active": true
    }
  ]
}
```

## Usage

### Accessing Admin Dashboard
1. Login as admin at `/admin/`
2. Navigate to "Directory" → "Login Histories"
3. View statistics, filter, and search login records

### Using the API
```bash
# Get login statistics (requires admin authentication)
curl -H "Authorization: Token YOUR_ADMIN_TOKEN" \
     https://co.riverlearn.co.ke/api/directory/auth/login-stats/
```

### Querying Login Data Programmatically
```python
from directory.models import LoginHistory
from django.utils import timezone
from datetime import timedelta

# Get today's logins
today = timezone.now().replace(hour=0, minute=0, second=0)
today_logins = LoginHistory.objects.filter(login_time__gte=today)

# Get active sessions
active_sessions = LoginHistory.objects.filter(
    logout_time__isnull=True,
    success=True
)

# Get user's login history
user_logins = LoginHistory.objects.filter(user=user).order_by('-login_time')

# Get failed login attempts
failed_logins = LoginHistory.objects.filter(
    success=False,
    login_time__gte=timezone.now() - timedelta(hours=24)
)
```

## Security Features

### Failed Login Monitoring
- Automatic logging of failed login attempts
- Tracking by IP address
- Warning logs after 5+ failures within 1 hour
- Admin dashboard shows suspicious IPs

### Session Tracking
- Monitors active sessions
- Detects multiple concurrent sessions (future enhancement)
- Tracks session duration

### Audit Trail
- Complete history of all authentication events
- Immutable records (read-only in admin)
- Indexed for fast queries

## Future Enhancements

### Planned Features:
1. **Geographic Location**: Integration with IP geolocation API (ipapi.co or similar)
2. **Real-time Alerts**: Email notifications for suspicious activity
3. **User Notifications**: Alert users on new device logins
4. **Rate Limiting**: Automatic temporary IP blocks after repeated failures
5. **WebSocket Updates**: Real-time admin dashboard updates
6. **Export Functionality**: CSV/Excel export for compliance reporting
7. **Analytics Charts**: Visual charts for login trends

### Geographic Location Setup
To enable location tracking:
1. Sign up for ipapi.co or similar service
2. Update `directory/utils.py` `get_location_from_ip()` function:
```python
def get_location_from_ip(ip_address):
    import requests
    try:
        response = requests.get(f'https://ipapi.co/{ip_address}/json/')
        if response.status_code == 200:
            data = response.json()
            return f"{data.get('city', '')}, {data.get('country_name', '')}"
    except:
        pass
    return ""
```

## Database Schema

### LoginHistory Table
- `id`: Primary key
- `user_id`: Foreign key to User
- `login_time`: DateTime (indexed)
- `logout_time`: DateTime (nullable)
- `ip_address`: IP address
- `user_agent`: Full user agent string
- `device_type`: Mobile/Desktop/Tablet
- `browser`: Browser name and version
- `operating_system`: OS name and version
- `location`: City, Country (from IP)
- `session_key`: Django session key
- `success`: Boolean
- `failure_reason`: Text (for failed attempts)

### Indexes
- `login_time` (descending)
- `user_id, login_time` (composite)
- `ip_address`

## Maintenance

### Cleanup Old Records
Consider adding a periodic task to archive/delete old login records:

```python
from directory.models import LoginHistory
from django.utils import timezone
from datetime import timedelta

# Delete records older than 90 days
cutoff_date = timezone.now() - timedelta(days=90)
LoginHistory.objects.filter(login_time__lt=cutoff_date).delete()
```

### Performance Tips
- Indexes are already optimized for common queries
- Consider archiving old records to separate table after 6-12 months
- Use `.select_related('user')` when querying LoginHistory with user data

## Support
For issues or feature requests, contact the development team or create an issue in the project repository.

