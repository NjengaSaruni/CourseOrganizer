var config = {
  hosts: {
    domain: 'co.riverlearn.co.ke',
    anonymousdomain: 'guest.co.riverlearn.co.ke',
    muc: 'conference.co.riverlearn.co.ke',
    focus: 'focus.co.riverlearn.co.ke',
    bridge: 'jitsi-videobridge.co.riverlearn.co.ke'
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
