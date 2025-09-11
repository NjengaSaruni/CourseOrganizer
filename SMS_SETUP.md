# SMS Service Setup Guide

The Course Organizer now includes SMS functionality for sending passcodes and approval notifications to students.

## Features

- **Passcode SMS**: Send 6-digit passcodes to pending students
- **Approval SMS**: Notify students when their registration is approved
- **Fallback Mode**: Logs SMS content when Twilio credentials are not configured

## Setup Instructions

### Option 1: Twilio (Recommended for Production)

1. **Sign up for Twilio**:
   - Go to [https://twilio.com](https://twilio.com)
   - Create a free account (includes $15 credit)
   - Verify your phone number

2. **Get Credentials**:
   - From your Twilio Console Dashboard, copy:
     - Account SID
     - Auth Token
   - Purchase a phone number (or use the trial number)

3. **Set Environment Variables**:
   ```bash
   # For local development
   export TWILIO_ACCOUNT_SID="your_account_sid_here"
   export TWILIO_AUTH_TOKEN="your_auth_token_here"
   export TWILIO_FROM_NUMBER="+1234567890"  # Your Twilio number
   ```

   For Railway deployment:
   ```bash
   railway variables --set "TWILIO_ACCOUNT_SID=your_account_sid_here"
   railway variables --set "TWILIO_AUTH_TOKEN=your_auth_token_here"
   railway variables --set "TWILIO_FROM_NUMBER=+1234567890"
   ```

### Option 2: Fallback Mode (Development/Testing)

If no Twilio credentials are provided, the system will:
- Log all SMS content to console/logs
- Return success responses for testing
- Allow full admin workflow testing

## Testing SMS Service

### Test Command
```bash
# Test passcode SMS
python manage.py test_sms --phone "+254700000000" --type passcode

# Test approval SMS
python manage.py test_sms --phone "+254700000000" --type approval
```

### Admin Panel Testing
1. Login as admin (`admin@uon.ac.ke`)
2. Go to Admin Panel (`/admin`)
3. Find a pending registration
4. Click "Generate Passcode"
5. Click "Send SMS" - this will send the passcode via SMS
6. Click "Approve Registration" - this will send an approval notification

## SMS Templates

### Passcode SMS
```
Hello [Student Name]! Your Course Organizer passcode is: [123456]. Use this to complete your registration at the University of Nairobi Law School.
```

### Approval SMS
```
Congratulations [Student Name]! Your registration for University of Nairobi Law School has been approved. You can now access your student portal.
```

## Phone Number Format

The service automatically handles phone number formatting:
- Removes spaces and dashes
- Adds +254 country code for Kenya numbers
- Supports formats: `0700123456`, `254700123456`, `+254700123456`

## Troubleshooting

### Common Issues

1. **"No module named 'twilio'"**:
   ```bash
   pip install twilio==8.10.0
   ```

2. **SMS not sending**:
   - Check Twilio credentials
   - Verify phone number format
   - Check Twilio account balance
   - Review Twilio logs in console

3. **Trial account limitations**:
   - Can only send to verified phone numbers
   - Upgrade to paid account for production use

### Logs
- SMS attempts are logged to Django logs
- Check console output for SMS content in fallback mode
- Twilio delivery status is returned in API responses

## Cost Considerations

- **Twilio Trial**: $15 free credit (approximately 1,500 SMS)
- **Production**: ~$0.0075 per SMS to Kenya
- **Fallback Mode**: Free (logs only)

## Security Notes

- Never commit Twilio credentials to version control
- Use environment variables for all sensitive data
- Consider rate limiting for SMS endpoints
- Monitor SMS usage to prevent abuse
