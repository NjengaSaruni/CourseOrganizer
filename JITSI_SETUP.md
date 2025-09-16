# Jitsi Meet Setup for Course Organizer

## 🎯 Simple Railway Setup with riverlearn.co.ke

This guide sets up Jitsi Meet on Railway with your `riverlearn.co.ke` domain for complete data sovereignty.

## Prerequisites

- Railway account
- Access to `riverlearn.co.ke` DNS
- Course Organizer already deployed on Railway

## Step 1: Create Jitsi Service on Railway

### 1.1 Create New Railway Service

```bash
# Create a new Railway service for Jitsi
railway login
railway new
# Name it: course-organizer-jitsi
```

### 1.2 Add Files to Your Jitsi Service

Create these files in your Jitsi Railway service:

**package.json:**
```json
{
  "name": "course-organizer-jitsi",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**server.js:**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.jitsi.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
      frameSrc: ["'self'", "https://*.jitsi.net"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  }
}));

app.use(cors());
app.use(express.static('public'));

// Serve Jitsi Meet
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve Jitsi configuration
app.get('/config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'config.js'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Jitsi Meet server running on port ${PORT}`);
});
```

**config.js:**
```javascript
var config = {
  hosts: {
    domain: 'jitsi.riverlearn.co.ke',
    anonymousdomain: 'guest.jitsi.riverlearn.co.ke',
    muc: 'conference.jitsi.riverlearn.co.ke',
    focus: 'focus.jitsi.riverlearn.co.ke',
    bridge: 'jitsi-videobridge.jitsi.riverlearn.co.ke'
  },
  
  // JWT Authentication
  enableJWT: true,
  tokenAuthUrl: 'https://co.riverlearn.co.ke/api/jitsi/token/',
  
  // Security & Privacy
  enableWelcomePage: false,
  enableUserRolesBasedOnToken: true,
  disableThirdPartyRequests: true,
  analytics: { disabled: true },
  
  // UI
  applicationName: 'Course Organizer Video Call',
  defaultLocalDisplayName: 'Me',
  defaultRemoteDisplayName: 'Fellow Student',
  
  // Features
  startWithAudioMuted: false,
  startWithVideoMuted: false,
  prejoinPageEnabled: true,
  p2p: { enabled: true }
};
```

**public/index.html:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Course Organizer Video Call</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://meet.jit.si/external_api.js"></script>
</head>
<body>
  <div id="jitsi-container" style="width: 100%; height: 100vh;"></div>
  
  <script>
    const urlParams = new URLSearchParams(window.location.search);
    const roomName = urlParams.get('room') || 'default-room';
    const jwt = urlParams.get('jwt');
    
    const domain = 'jitsi.riverlearn.co.ke';
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: document.querySelector('#jitsi-container'),
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false
      },
      interfaceConfigOverwrite: {
        APP_NAME: 'Course Organizer',
        DEFAULT_REMOTE_DISPLAY_NAME: 'Fellow Student',
        DEFAULT_LOCAL_DISPLAY_NAME: 'Me'
      }
    };
    
    const api = new JitsiMeetExternalAPI(domain, options);
    
    if (jwt) {
      api.executeCommand('displayName', 'Authenticated User');
    }
  </script>
</body>
</html>
```

### 1.3 Deploy to Railway

```bash
railway up
```

## Step 2: Configure DNS

Create these CNAME records in your DNS (pointing to your Jitsi Railway service):

```
jitsi.riverlearn.co.ke                    → jitsi-server-production.up.railway.app
conference.jitsi.riverlearn.co.ke         → jitsi-server-production.up.railway.app
focus.jitsi.riverlearn.co.ke              → jitsi-server-production.up.railway.app
guest.jitsi.riverlearn.co.ke              → jitsi-server-production.up.railway.app
jitsi-videobridge.jitsi.riverlearn.co.ke  → jitsi-server-production.up.railway.app
```

## Step 3: Update Course Organizer

### 3.1 Environment Variables

Add to your Course Organizer Railway service:

```bash
JITSI_DOMAIN=jitsi.riverlearn.co.ke
JITSI_APP_SECRET=your-strong-jwt-secret-here
```

### 3.2 Test JWT Generation

Your Course Organizer already has JWT authentication built-in. Test it:

```bash
# Test JWT token generation
curl -X POST https://co.riverlearn.co.ke/api/jitsi/token/ \
  -H "Authorization: Token YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"room_name": "test-room"}'
```

## Step 4: Test the Setup

### 4.1 Test Basic Jitsi

Visit: `https://co.riverlearn.co.ke/test-room`

### 4.2 Test JWT Authentication

Use your Course Organizer to join a video call - it should automatically use JWT authentication.

## Local Development (Optional)

For local development, update your Course Organizer settings:

```bash
# In your local .env file
JITSI_DOMAIN=meet.jit.si
```

This will use the public Jitsi instance for local testing.

## Troubleshooting

### Common Issues

1. **DNS not working**: Wait 24-48 hours for DNS propagation
2. **JWT errors**: Check that `JITSI_APP_SECRET` matches between services
3. **CORS errors**: Ensure your Jitsi service allows requests from `co.riverlearn.co.ke`

### Logs

Check Railway logs:
```bash
railway logs
```

## Benefits

- ✅ **Data Sovereignty**: Your data stays on Railway
- ✅ **Custom Domain**: Users see `co.riverlearn.co.ke`
- ✅ **JWT Authentication**: Secure user management
- ✅ **Cost Effective**: No additional server costs
- ✅ **Easy Maintenance**: Railway handles infrastructure
- ✅ **Scalable**: Automatically scales with usage

## File Structure

```
course-organizer-jitsi/
├── package.json
├── server.js
├── config.js
└── public/
    └── index.html
```

That's it! One simple setup that gives you complete control over your video conferencing data.