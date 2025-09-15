# Daily.co Video Call Integration Setup

This guide will help you set up Daily.co video calls for your course organizer system.

## 1. Create Daily.co Account

1. Go to [Daily.co](https://daily.co/) and create an account
2. Sign up for a free plan or choose a paid plan based on your needs
3. Navigate to your dashboard at [dashboard.daily.co](https://dashboard.daily.co/)

## 2. Get Your API Key

1. In your Daily.co dashboard, go to "Developers" → "API Keys"
2. Create a new API key or copy your existing one
3. The API key will look like: `sk_test_1234567890abcdef1234567890abcdef12345678`

## 3. Configure Environment Variables

Add the following environment variables to your system:

### For Local Development:
Create a `.env` file in the backend directory:
```bash
# Daily.co Configuration
DAILY_API_KEY=your_daily_co_api_key_here
DAILY_DOMAIN=daily.co
```

### For Production (Railway/Heroku):
Add these environment variables in your deployment platform:
- `DAILY_API_KEY`: Your Daily.co API key
- `DAILY_DOMAIN`: daily.co (or your custom domain if you have one)

## 4. SDK Setup

The Daily.co JavaScript SDK is automatically included in the frontend application via CDN. The SDK is loaded in `index.html` and provides the necessary functionality for video calls.

### SDK Loading:
- ✅ Daily.co SDK loaded from CDN
- ✅ Automatic fallback to direct URL if SDK fails to load
- ✅ Error handling and retry functionality
- ✅ Proper initialization with delays to ensure SDK is ready

### Frontend Integration:
- ✅ `VideoCallService` handles Daily.co and Jitsi integration
- ✅ **Embedded video calls within the Course Organizer app**
- ✅ Custom video call modal with professional styling
- ✅ Fullscreen support and responsive design
- ✅ Error handling with user-friendly messages
- ✅ Seamless integration - no popup windows

## 5. Features Included

The integration includes:

### Backend Features:
- ✅ Automatic room creation for timetable entries
- ✅ Admin user as default host
- ✅ Token-based authentication
- ✅ Room management (create, delete, join)
- ✅ Recording capabilities
- ✅ Participant management
- ✅ Room expiration handling

### Frontend Features:
- ✅ Seamless video call integration in timetable
- ✅ Custom video call UI with Daily.co branding
- ✅ Fullscreen support
- ✅ Chat, screen sharing, and recording controls
- ✅ Responsive design
- ✅ Error handling and retry functionality

### Video Call Features:
- ✅ HD video and audio
- ✅ Screen sharing
- ✅ Chat messaging
- ✅ Hand raising
- ✅ Virtual backgrounds
- ✅ Noise cancellation
- ✅ Recording (cloud recording)
- ✅ Participant management
- ✅ Mobile support
- ✅ **Embedded within Course Organizer interface**
- ✅ **Fullscreen mode support**
- ✅ **Custom modal with meeting information**
- ✅ **Integrated controls (Leave Call, Fullscreen)**

## 6. Usage

### For Admins:
1. Go to the Timetable page
2. Click "📹 Create Video Call" on any class entry
3. The system automatically creates a Daily.co room
4. Students can join when the button becomes available

### For Students:
1. Go to the Timetable page
2. Look for "📹 Join Video Call" buttons
3. Click to join any future scheduled class (no time restrictions)
4. Video call opens embedded within the Course Organizer app with full functionality

## 7. Room Naming Convention

Rooms are automatically named using this pattern:
```
{course-code}-{day}-{time}
```

Example: `cs101-monday-0800` for CS101 Monday 8:00 AM class

## 8. Security Features

- ✅ Token-based authentication
- ✅ Admin-only room creation/deletion
- ✅ User authentication required
- ✅ Room expiration (24 hours)
- ✅ Secure API key handling

## 9. Troubleshooting

### Common Issues:

1. **"Daily.co API key not configured"**
   - Ensure `DAILY_API_KEY` environment variable is set
   - Restart your backend server after adding the environment variable

2. **"Failed to create Daily.co room"**
   - Check your API key is valid and has proper permissions
   - Verify your Daily.co account is active

3. **Video call window doesn't open**
   - Check browser popup blockers
   - Ensure JavaScript is enabled

4. **Can't join video call**
   - Verify the meeting is scheduled in the future
   - Check your internet connection

5. **Theme configuration error**
   - If you see "unsupported theme configuration" errors, the theme has been fixed to use the correct "colors" property
   - Refresh the page and try again

6. **Token validation error**
   - If you see "token should be a string" errors, the token handling has been improved
   - The system now properly validates and formats tokens before passing to Daily.co
   - Check the browser console for detailed token information

7. **URL property error**
   - If you see "url property isn't set" errors, the URL is now properly set in the iframe configuration
   - The system validates room URLs before attempting to create video calls
   - Check that the backend is properly generating Daily.co room URLs

8. **Empty room URL error**
   - If you see "Room URL is empty or invalid" errors, the system now automatically falls back to Jitsi Meet
   - This happens when Daily.co API is not configured or room creation fails
   - The system will generate a Jitsi room URL as a fallback to ensure video calls still work

9. **Video call stuck on "Connecting"**
   - If the video call modal shows "Connecting to video call..." indefinitely, the system now has timeout mechanisms
   - After 30 seconds, it will show an error with troubleshooting steps
   - The system automatically falls back to Jitsi if Daily.co fails to initialize
   - Check browser permissions for camera/microphone access

10. **Daily.co URL property error**
    - If you see "url property isn't set" errors, the system now has enhanced URL validation
    - The frontend automatically falls back to Jitsi Meet if Daily.co URL is empty
    - Enhanced debugging logs help identify URL generation issues
    - Automatic fallback ensures video calls always work regardless of backend configuration

11. **Platform mismatch error**
    - If you see Daily.co trying to load Jitsi URLs, the system now detects the actual platform from the URL
    - The frontend checks if the URL contains 'daily.co' or 'meet.jit.si' to determine the correct method
    - Backend now properly reports the actual platform being used based on the generated URL
    - Enhanced platform detection prevents mismatched video call methods

12. **Media permissions**
    - The system now requests camera and microphone permissions upfront for better user experience
    - Permission status is shown in the loading screen with color-coded feedback
    - Users receive clear notifications about permission status
    - Automatic permission requests prevent video call delays and improve connection reliability

### Support:
- Daily.co Documentation: https://docs.daily.co/
- Daily.co Support: https://help.daily.co/

## 10. Pricing

Daily.co offers:
- **Free Plan**: Up to 2,000 participant-minutes per month
- **Pro Plan**: $29/month for 10,000 participant-minutes
- **Business Plan**: $99/month for 50,000 participant-minutes

Check current pricing at: https://daily.co/pricing

## 11. Advanced Configuration

You can customize the video call experience by modifying the room properties in `backend/course_api/daily_service.py`:

```python
room_properties = {
    'max_participants': 50,  # Maximum participants
    'enable_recording': 'cloud',  # Enable cloud recording
    'enable_prejoin_ui': True,  # Show pre-join screen
    'enable_knocking': False,  # Disable knocking for security
    'enable_screenshare': True,  # Enable screen sharing
    'enable_chat': True,  # Enable chat
    'enable_hand_raising': True,  # Enable hand raising
}
```

## 12. Testing

To test the integration:

1. Set up your Daily.co API key
2. Create a timetable entry
3. Create a video call for that entry
4. Try joining the video call
5. Test recording, screen sharing, and other features

The system will automatically fall back to Jitsi Meet if Daily.co is not configured.
