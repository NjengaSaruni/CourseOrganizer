import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Lib-Jitsi-Meet types (we'll create these)
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export interface JitsiMeetUser {
  displayName: string;
  email?: string;
  avatar?: string;
}

export interface JitsiMeetConfig {
  roomName: string;
  userInfo?: JitsiMeetUser;
  width?: string | number;
  height?: string | number;
  parentNode?: HTMLElement;
  configOverwrite?: any;
  interfaceConfigOverwrite?: any;
}

@Component({
  selector: 'app-lib-jitsi-video-call',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- Header with RiverLearn branding -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <img src="/courseorganizerlogo.png" 
                 alt="RiverLearn Logo" 
                 class="h-8 w-auto">
            <div>
              <h1 class="text-lg font-semibold text-gray-900">{{ meetingTitle || 'Video Meeting' }}</h1>
              <p class="text-sm text-gray-600">{{ roomName }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button (click)="toggleFullscreen()" 
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
              </svg>
            </button>
            <button (click)="leaveMeeting()" 
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
              Leave Meeting
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Connecting to meeting...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="flex-1 flex items-center justify-center">
        <div class="text-center max-w-md">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Connection Failed</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button (click)="retryConnection()" 
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Try Again
          </button>
        </div>
      </div>

      <!-- Jitsi Meet Container -->
      <div #jitsiContainer 
           class="flex-1 relative"
           [class.hidden]="isLoading || error">
      </div>

      <!-- Meeting Controls Overlay -->
      <div *ngIf="!isLoading && !error" 
           class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <div class="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center space-x-2">
            <!-- Microphone Toggle -->
            <button (click)="toggleAudio()" 
                    [class]="isAudioMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'"
                    class="p-3 rounded-xl hover:bg-opacity-80 transition-colors">
              <svg *ngIf="!isAudioMuted" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
              <svg *ngIf="isAudioMuted" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27 6.73 8H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3z"/>
              </svg>
            </button>

            <!-- Camera Toggle -->
            <button (click)="toggleVideo()" 
                    [class]="isVideoMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'"
                    class="p-3 rounded-xl hover:bg-opacity-80 transition-colors">
              <svg *ngIf="!isVideoMuted" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              <svg *ngIf="isVideoMuted" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.55-.18L19.73 21 21 19.73 3.27 2zM5 16V8h1.73l8 8H5z"/>
              </svg>
            </button>

            <!-- Screen Share -->
            <button (click)="toggleScreenShare()" 
                    [class]="isScreenSharing ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
                    class="p-3 rounded-xl hover:bg-opacity-80 transition-colors">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
              </svg>
            </button>

            <!-- Chat Toggle -->
            <button (click)="toggleChat()" 
                    [class]="isChatOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
                    class="p-3 rounded-xl hover:bg-opacity-80 transition-colors">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
            </button>

            <!-- Participants -->
            <button (click)="toggleParticipants()" 
                    [class]="isParticipantsOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
                    class="p-3 rounded-xl hover:bg-opacity-80 transition-colors">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5 12.01 8.99A2.5 2.5 0 0 0 10 8H8.46c-.8 0-1.54.37-2.01.99L4 10.5 2.01 8.99A2.5 2.5 0 0 0 0 8v10h2v6h4v-6h2v6h4v-6h2v6h4z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
    
    .hidden {
      display: none !important;
    }
    
    /* Hide Jitsi watermarks completely */
    :host ::ng-deep .watermark,
    :host ::ng-deep .leftwatermark,
    :host ::ng-deep .rightwatermark,
    :host ::ng-deep .poweredby,
    :host ::ng-deep .powered-by,
    :host ::ng-deep .jitsi-watermark,
    :host ::ng-deep .jitsi-logo,
    :host ::ng-deep .jitsi-brand,
    :host ::ng-deep .brand-watermark,
    :host ::ng-deep .brand-logo,
    :host ::ng-deep .meet-logo,
    :host ::ng-deep .meet-watermark,
    :host ::ng-deep [class*="watermark"],
    :host ::ng-deep [class*="logo"],
    :host ::ng-deep [class*="brand"],
    :host ::ng-deep [class*="powered"],
    :host ::ng-deep [id*="watermark"],
    :host ::ng-deep [id*="logo"],
    :host ::ng-deep [id*="brand"],
    :host ::ng-deep [id*="powered"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      width: 0 !important;
      height: 0 !important;
      position: absolute !important;
      left: -9999px !important;
      top: -9999px !important;
      z-index: -1 !important;
    }
    
    /* Additional targeting for iframe content */
    :host ::ng-deep iframe {
      position: relative;
    }
    
    /* Hide any remaining watermarks with more specific selectors */
    :host ::ng-deep .videocontainer .watermark,
    :host ::ng-deep .videocontainer .leftwatermark,
    :host ::ng-deep .videocontainer .rightwatermark,
    :host ::ng-deep .videocontainer .poweredby,
    :host ::ng-deep .videocontainer .jitsi-watermark,
    :host ::ng-deep .videocontainer .jitsi-logo,
    :host ::ng-deep .videocontainer .brand-watermark,
    :host ::ng-deep .videocontainer .brand-logo,
    :host ::ng-deep .videocontainer .meet-logo,
    :host ::ng-deep .videocontainer .meet-watermark {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      width: 0 !important;
      height: 0 !important;
      position: absolute !important;
      left: -9999px !important;
      top: -9999px !important;
      z-index: -1 !important;
    }
  `]
})
export class LibJitsiVideoCallComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('jitsiContainer', { static: true }) jitsiContainer!: ElementRef;

  @Input() roomName: string = '';
  @Input() meetingTitle: string = '';
  @Input() userInfo: JitsiMeetUser = { displayName: 'User' };
  @Input() domain: string = 'jitsi.riverlearn.co.ke';

  @Output() meetingEnded = new EventEmitter<void>();
  @Output() participantJoined = new EventEmitter<any>();
  @Output() participantLeft = new EventEmitter<any>();
  @Output() closeRequested = new EventEmitter<void>();

  // State
  isLoading: boolean = true;
  error: string | null = null;
  jitsiApi: any = null;
  private cleanupTimeout: any = null;

  // Meeting controls state
  isAudioMuted: boolean = false;
  isVideoMuted: boolean = false;
  isScreenSharing: boolean = false;
  isChatOpen: boolean = false;
  isParticipantsOpen: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadJitsiMeetScript();
    
    // Add global WebSocket error handler
    this.setupWebSocketErrorHandler();
  }

  private setupWebSocketErrorHandler() {
    // Override console.error to catch WebSocket errors
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('WebSocket connection to') && message.includes('failed')) {
        console.log('LibJitsiVideoCall: WebSocket connection failed, cleaning up');
        this.cleanupAndEmitMeetingEnded();
      }
      originalError.apply(console, args);
    };
  }

  ngAfterViewInit() {
    // Component is ready, but we'll wait for the script to load
  }

  ngOnDestroy() {
    console.log('LibJitsiVideoCall: Component destroying, disposing API');
    
    // Clear any pending timeout
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout);
      this.cleanupTimeout = null;
    }
    
    // Clean up injected watermark hiding CSS
    this.cleanupWatermarkHidingCSS();
    
    // Clean up the Jitsi API
    this.cleanupAndEmitMeetingEnded();
  }

  private loadJitsiMeetScript() {
    // Check if script is already loaded
    if (window.JitsiMeetExternalAPI) {
      this.initializeJitsiMeet();
      return;
    }

    // Load the script from our self-hosted server
    const script = document.createElement('script');
    script.src = `https://${this.domain}/libs/external_api.min.js`;
    script.onload = () => {
      this.initializeJitsiMeet();
    };
    script.onerror = () => {
      this.error = 'Failed to load Jitsi Meet library';
      this.isLoading = false;
    };
    document.head.appendChild(script);
  }

  private initializeJitsiMeet() {
    try {
      const config: JitsiMeetConfig = {
        roomName: this.roomName,
        parentNode: this.jitsiContainer.nativeElement,
        width: '100%',
        height: '100%',
        userInfo: {
          displayName: this.userInfo.displayName,
          email: this.userInfo.email || undefined, // Don't pass empty string to avoid Gravatar 404
          avatar: this.userInfo.avatar || undefined // Don't pass empty string
        },
        configOverwrite: {
          // Custom configuration for our server
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          enableClosePage: false,
          enableInsecureRoomNameWarning: false,
          enableNoisyMicDetection: true,
          enableTalkWhileMuted: true,
          enableLayerSuspension: true,
          channelLastN: -1,
          startScreenSharing: false,
          enableRemb: true,
          enableTcc: true,
          useRoomAsSharedDocumentName: true,
          enableIceRestart: true,
          useStunTurn: true,
          enableOpusRed: true,
          opusMaxAverageBitrate: 64000,
          enableRtx: true,
          enableSdpSemantics: 'unified-plan',
          enableNoAudioDetection: true,
          enableLipSync: false,
          enableFaceExpressions: false,
          // Force routing via JVB to improve cross-network connectivity
          enableP2P: false,
          disableThirdPartyRequests: true, // Disable Gravatar and other third-party requests
          p2p: {
            enabled: false,
            stunServers: [
              { urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443' }
            ]
          },
          disableDeepLinking: true,
          startAudioOnly: false
        },
        interfaceConfigOverwrite: {
          // RiverLearn Course Organizer Interface Configuration
          APP_NAME: 'RiverLearn',
          PROVIDER_NAME: 'RiverLearn Course Organizer',
          NATIVE_APP_NAME: 'RiverLearn Course Organizer',
          
          // Complete watermark and branding removal
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_POWERED_BY: false,
          SHOW_POLICY_WATERMARK: false,
          SHOW_LOGO: false,
          SHOW_BRAND: false,
          SHOW_JITSI_LOGO: false,
          SHOW_BRAND_LOGO: false,
          SHOW_MEET_LOGO: false,
          SHOW_MEET_WATERMARK: false,
          SHOW_LEFT_WATERMARK: false,
          SHOW_RIGHT_WATERMARK: false,
          SHOW_POWERED_BY_JITSI: false,
          SHOW_POWERED_BY_LOGO: false,
          
          // Disable all branding
          DISABLE_BRANDING: true,
          DISABLE_WATERMARKS: true,
          DISABLE_LOGO: true,
          
          // RiverLearn theme colors
          AUDIO_LEVEL_PRIMARY_COLOR: '#2A68AF', // RiverLearn primary blue
          AUDIO_LEVEL_SECONDARY_COLOR: '#122B40', // RiverLearn navy
          DEFAULT_BACKGROUND: '#ffffff',
          
          // RiverLearn branding
          DEFAULT_LOGO_URL: 'https://co.riverlearn.co.ke/courseorganizerlogo.png',
          DEFAULT_WELCOME_PAGE_LOGO_URL: 'https://co.riverlearn.co.ke/courseorganizerlogo.png',
          DEFAULT_LOGO_URL_HREF: 'https://co.riverlearn.co.ke',
          DEFAULT_WELCOME_PAGE_LOGO_URL_HREF: 'https://co.riverlearn.co.ke',
          
          // UI behavior
          SHOW_LOBBY_BUTTON: true,
          SHOW_MEETING_TIMER: true,
          TOOLBAR_TIMEOUT: 4000,
          TOOLBAR_ALWAYS_VISIBLE: false,
          TOOLBAR_BUTTONS_WIDTH: 77,
          TOOLBAR_BUTTONS_HEIGHT: 60,
          
          // Disable unnecessary pages
          SHOW_DEEP_LINKING_PAGE: false,
          SHOW_AUTHENTICATION_PAGE: false,
          SHOW_LIVE_STREAMING_PAGE: false,
          SHOW_RECORDING_PAGE: false,
          SHOW_TRANSCRIPTION_PAGE: false,
          SHOW_CLOSE_PAGE: false,
          SHOW_WELCOME_PAGE: false,
          SHOW_PREJOIN_PAGE: false,
          SHOW_JOIN_PAGE: false,
          SHOW_LEAVE_PAGE: false,
          SHOW_ERROR_PAGE: false,
          SHOW_LOADING_PAGE: false,
          SHOW_SETTINGS_PAGE: false,
          SHOW_ABOUT_PAGE: false,
          SHOW_HELP_PAGE: false,
          SHOW_FEEDBACK_PAGE: false,
          SHOW_STATS_PAGE: false,
          SHOW_SHORTCUTS_PAGE: false,
          SHOW_KEYBOARD_SHORTCUTS_PAGE: false,
          SHOW_AUDIO_SETTINGS_PAGE: false,
          SHOW_VIDEO_SETTINGS_PAGE: false,
          SHOW_MORE_SETTINGS_PAGE: false,
          SHOW_DEVICE_SETTINGS_PAGE: false,
          SHOW_NETWORK_SETTINGS_PAGE: false,
          
          // Toolbar configuration for education
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
          ],
          
          // Settings sections
          SETTINGS_SECTIONS: [
            'devices', 'language', 'moderator', 'profile', 'calendar', 'sounds', 'more'
          ],
          
          // Connection and performance
          CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: true,
          CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 5000,
          CONNECTION_INDICATOR_DISABLED: false,
          
          // Video layout
          VIDEO_LAYOUT_FIT: 'both',
          
          // Notifications
          ENFORCE_NOTIFICATION_AUTO_DISMISS_TIMEOUT: 15000,
          
          // Security and privacy
          WHITELISTED_DOMAINS: ['riverlearn.co.ke', 'co.riverlearn.co.ke'],
          DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
          DISABLE_FOCUS_INDICATOR: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          DISABLE_PRESENCE_STATUS: false,
          DISABLE_RINGING: false,
          
          // Support and branding
          SUPPORT_URL: 'https://riverlearn.co.ke/support',
          DEFAULT_LOCAL_DISPLAY_NAME: 'Participant',
          RECENT_LIST_ENABLED: true,
          RENDER_RECENT_LIST_ONLY: false,
          REMOTE_VIDEO_MENU_DISABLED: false
        }
      };

      this.jitsiApi = new window.JitsiMeetExternalAPI(this.domain, config);

      // Event listeners
      this.jitsiApi.addListener('videoConferenceJoined', () => {
        console.log('LibJitsiVideoCall: Joined video conference');
        this.isLoading = false;
        this.error = null;
        
        // Hide watermarks after joining
        this.hideJitsiWatermarks();
        
        // Try to use Jitsi API commands to hide watermarks
        this.tryJitsiWatermarkCommands();
        
        // Set up a timeout to handle cases where conference is destroyed but events don't fire
        this.cleanupTimeout = setTimeout(() => {
          console.log('LibJitsiVideoCall: Cleanup timeout reached, checking if still connected');
          if (this.jitsiApi) {
            try {
              // Try to check if the conference is still active
              const participants = this.jitsiApi.getParticipantsInfo();
              if (!participants || participants.length === 0) {
                console.log('LibJitsiVideoCall: No participants found, cleaning up');
                this.cleanupAndEmitMeetingEnded();
              }
            } catch (error) {
              console.log('LibJitsiVideoCall: Error checking participants, cleaning up:', error);
              this.cleanupAndEmitMeetingEnded();
            }
          }
        }, 30000); // 30 second timeout
      });


      this.jitsiApi.addListener('participantJoined', (participant: any) => {
        console.log('Participant joined:', participant);
        this.participantJoined.emit(participant);
      });

      this.jitsiApi.addListener('participantLeft', (participant: any) => {
        console.log('Participant left:', participant);
        this.participantLeft.emit(participant);
      });

      this.jitsiApi.addListener('audioMuteStatusChanged', (data: any) => {
        this.isAudioMuted = data.muted;
      });

      this.jitsiApi.addListener('videoMuteStatusChanged', (data: any) => {
        this.isVideoMuted = data.muted;
      });

      this.jitsiApi.addListener('screenShareToggled', (data: any) => {
        this.isScreenSharing = data.isSharing;
      });

      // Add event listeners for conference failures and termination
      this.jitsiApi.addListener('videoConferenceLeft', () => {
        console.log('LibJitsiVideoCall: videoConferenceLeft event received');
        this.cleanupAndEmitMeetingEnded();
      });

      this.jitsiApi.addListener('readyToClose', () => {
        console.log('LibJitsiVideoCall: readyToClose event received');
        this.cleanupAndEmitMeetingEnded();
      });

      this.jitsiApi.addListener('hangup', () => {
        console.log('LibJitsiVideoCall: hangup event received - cleaning up immediately');
        // Add a small delay to ensure the hangup command is processed
        setTimeout(() => {
          this.cleanupAndEmitMeetingEnded();
        }, 100);
        
      });

      // Handle conference failures and destruction
      this.jitsiApi.addListener('conferenceFailed', (error: any) => {
        console.log('LibJitsiVideoCall: conferenceFailed event received:', error);
        this.cleanupAndEmitMeetingEnded();
      });

      this.jitsiApi.addListener('conferenceDestroyed', (error: any) => {
        console.log('LibJitsiVideoCall: conferenceDestroyed event received:', error);
        this.cleanupAndEmitMeetingEnded();
      });

      // Handle moderator ending meeting for all
      this.jitsiApi.addListener('meetingEnded', () => {
        console.log('LibJitsiVideoCall: meetingEnded event received (moderator ended meeting for all)');
        this.cleanupAndEmitMeetingEnded();
      });

      // Add listener for any button clicks to help debug
      this.jitsiApi.addListener('toolbarButtonClicked', (event: any) => {
        try {
          const key = event?.key ?? event;
          console.log('LibJitsiVideoCall: Toolbar button clicked:', key);
          if (key === 'hangup') {
            console.log('LibJitsiVideoCall: Hangup toolbar button detected - cleaning up');
            // Ensure consistent cleanup when user clicks the in-call hangup
            setTimeout(() => {
              this.cleanupAndEmitMeetingEnded();
            }, 100);
          }
        } catch (err) {
          console.log('LibJitsiVideoCall: error handling toolbarButtonClicked', err);
        }
      });

      // Handle WebSocket connection errors
      this.jitsiApi.addListener('connectionFailed', (error: any) => {
        console.log('LibJitsiVideoCall: connectionFailed event received:', error);
        this.cleanupAndEmitMeetingEnded();
      });

      // Handle any other errors
      this.jitsiApi.addListener('error', (error: any) => {
        console.log('LibJitsiVideoCall: error event received:', error);
        this.cleanupAndEmitMeetingEnded();
      });

    } catch (error) {
      console.error('Failed to initialize Jitsi Meet:', error);
      this.error = 'Failed to initialize video conference';
      this.isLoading = false;
    }
  }

  // Meeting control methods
  toggleAudio() {
    if (this.jitsiApi) {
      this.jitsiApi.executeCommand('toggleAudio');
    }
  }

  toggleVideo() {
    if (this.jitsiApi) {
      this.jitsiApi.executeCommand('toggleVideo');
    }
  }

  toggleScreenShare() {
    if (this.jitsiApi) {
      this.jitsiApi.executeCommand('toggleShareScreen');
    }
  }

  toggleChat() {
    if (this.jitsiApi) {
      this.jitsiApi.executeCommand('toggleChat');
    }
  }

  toggleParticipants() {
    if (this.jitsiApi) {
      this.jitsiApi.executeCommand('toggleFilmstrip');
    }
  }

  toggleFullscreen() {
    if (this.jitsiApi) {
      this.jitsiApi.executeCommand('toggleFullscreen');
    }
  }

  leaveMeeting() {
    console.log('Leave meeting called');
    if (this.jitsiApi) {
      console.log('LibJitsiVideoCall: Executing hangup command');
      this.jitsiApi.executeCommand('hangup');
      
      // Add a backup cleanup in case the hangup event doesn't fire
      setTimeout(() => {
        if (this.jitsiApi) {
          console.log('LibJitsiVideoCall: Backup cleanup triggered - hangup event may not have fired');
          this.cleanupAndEmitMeetingEnded();
        }
      }, 2000); // 2 second backup
    } else {
      console.log('LibJitsiVideoCall: No Jitsi API available, cleaning up immediately');
      this.cleanupAndEmitMeetingEnded();
    }
  }

  /**
   * Clean up Jitsi API and emit meeting ended event
   */
  private cleanupAndEmitMeetingEnded() {
    console.log('LibJitsiVideoCall: Cleaning up and emitting meeting ended');
    
    // Run cleanup inside Angular zone to ensure change detection
    this.ngZone.run(() => {
      // Clear any pending timeout
      if (this.cleanupTimeout) {
        clearTimeout(this.cleanupTimeout);
        this.cleanupTimeout = null;
      }
      
      // Clean up the Jitsi API
      if (this.jitsiApi) {
        try {
          this.jitsiApi.dispose();
        } catch (error) {
          console.warn('Error disposing Jitsi API:', error);
        }
        this.jitsiApi = null;
      }
      
      // Reset state
      this.isLoading = false;
      this.error = null;
      this.isAudioMuted = false;
      this.isVideoMuted = false;
      this.isScreenSharing = false;
      this.isChatOpen = false;
      this.isParticipantsOpen = false;
      
      // Trigger change detection
      this.cdr.detectChanges();
      
      // Emit the meeting ended event
      this.meetingEnded.emit();
    });
  }

  retryConnection() {
    this.isLoading = true;
    this.error = null;
    this.initializeJitsiMeet();
  }

  /**
   * Handle close request from overlay
   */
  onCloseRequested() {
    console.log('LibJitsiVideoCall: Close requested from overlay');
    this.leaveMeeting();
    this.closeRequested.emit();
  }

  /**
   * Force close the call (for debugging)
   */
  forceClose() {
    console.log('LibJitsiVideoCall: Force closing call');
    this.cleanupAndEmitMeetingEnded();
  }

  /**
   * Hide Jitsi watermarks by injecting CSS and manipulating DOM elements
   */
  private hideJitsiWatermarks() {
    console.log('LibJitsiVideoCall: Hiding Jitsi watermarks');
    
    // Inject CSS to hide watermarks
    this.injectWatermarkHidingCSS();
    
    // Try to inject CSS into the iframe
    this.tryInjectIframeCSS();
    
    // Use a MutationObserver to hide watermarks as they appear
    this.setupWatermarkObserver();
    
    // Also try to hide watermarks immediately
    setTimeout(() => {
      this.hideWatermarkElements();
    }, 1000);
    
    // Keep trying to hide watermarks periodically
    const hideInterval = setInterval(() => {
      this.hideWatermarkElements();
      this.tryInjectIframeCSS();
      this.tryOverlayWatermarks();
      this.tryInterceptWatermarkCreation();
    }, 2000);
    
    // Clear interval after 30 seconds
    setTimeout(() => {
      clearInterval(hideInterval);
    }, 30000);
  }

  /**
   * Inject CSS to hide watermarks
   */
  private injectWatermarkHidingCSS() {
    const styleId = 'jitsi-watermark-hider';
    
    // Remove existing style if it exists
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create new style element
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = this.getWatermarkHidingCSS();
    
    document.head.appendChild(style);
  }

  /**
   * Set up MutationObserver to hide watermarks as they appear
   */
  private setupWatermarkObserver() {
    const container = this.jitsiContainer?.nativeElement;
    if (!container) return;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.hideWatermarkInElement(node as Element);
            }
          });
        }
      });
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true
    });
    
    // Stop observing after 30 seconds
    setTimeout(() => {
      observer.disconnect();
    }, 30000);
  }

  /**
   * Hide watermark elements in a specific element
   */
  private hideWatermarkInElement(element: Element) {
    const watermarkSelectors = [
      '.watermark',
      '.leftwatermark',
      '.rightwatermark',
      '.poweredby',
      '.powered-by',
      '.jitsi-watermark',
      '.jitsi-logo',
      '.jitsi-brand',
      '.brand-watermark',
      '.brand-logo',
      '.meet-logo',
      '.meet-watermark',
      '[class*="watermark"]',
      '[class*="logo"]',
      '[class*="brand"]',
      '[class*="powered"]',
      '[id*="watermark"]',
      '[id*="logo"]',
      '[id*="brand"]',
      '[id*="powered"]'
    ];
    
    watermarkSelectors.forEach(selector => {
      const elements = element.querySelectorAll(selector);
      elements.forEach((el: Element) => {
        this.hideElement(el as HTMLElement);
      });
    });
    
    // Also check if the element itself is a watermark
    watermarkSelectors.forEach(selector => {
      if (element.matches(selector)) {
        this.hideElement(element as HTMLElement);
      }
    });
  }

  /**
   * Hide watermark elements throughout the container
   */
  private hideWatermarkElements() {
    const container = this.jitsiContainer?.nativeElement;
    if (!container) return;
    
    const watermarkSelectors = [
      '.watermark',
      '.leftwatermark',
      '.rightwatermark',
      '.poweredby',
      '.powered-by',
      '.jitsi-watermark',
      '.jitsi-logo',
      '.jitsi-brand',
      '.brand-watermark',
      '.brand-logo',
      '.meet-logo',
      '.meet-watermark',
      '[class*="watermark"]',
      '[class*="logo"]',
      '[class*="brand"]',
      '[class*="powered"]',
      '[id*="watermark"]',
      '[id*="logo"]',
      '[id*="brand"]',
      '[id*="powered"]',
      // Specific selectors for the element we found
      'a.watermark.leftwatermark',
      'a[class*="watermark"]',
      'a[class*="logo"]',
      'a[class*="brand"]',
      'a[class*="powered"]'
    ];
    
    watermarkSelectors.forEach(selector => {
      const elements = container.querySelectorAll(selector);
      elements.forEach((el: Element) => {
        this.hideElement(el as HTMLElement);
      });
    });
    
    // Also try to find and hide the specific element by its attributes
    this.hideSpecificWatermarkElement(container);
  }

  /**
   * Hide the specific watermark element we found
   */
  private hideSpecificWatermarkElement(container: Element) {
    // Look for the specific element with aria-label containing "Jitsi Meet Logo"
    const specificElement = container.querySelector('a[aria-label*="Jitsi Meet Logo"]');
    if (specificElement) {
      console.log('LibJitsiVideoCall: Found specific Jitsi watermark element, hiding it');
      this.hideElement(specificElement as HTMLElement);
    }
    
    // Also look for elements with href to jitsi.org
    const jitsiLinkElements = container.querySelectorAll('a[href*="jitsi.org"]');
    jitsiLinkElements.forEach(el => {
      if (el.classList.contains('watermark') || el.classList.contains('leftwatermark')) {
        console.log('LibJitsiVideoCall: Found Jitsi.org watermark link, hiding it');
        this.hideElement(el as HTMLElement);
      }
    });
    
    // Look for elements with background-image containing watermark.svg
    const watermarkSvgElements = container.querySelectorAll('[style*="watermark.svg"]');
    watermarkSvgElements.forEach(el => {
      console.log('LibJitsiVideoCall: Found watermark.svg element, hiding it');
      this.hideElement(el as HTMLElement);
    });
  }

  /**
   * Hide a specific element
   */
  private hideElement(element: HTMLElement) {
    if (!element) return;
    
    // Remove the element from DOM completely if it's a watermark
    if (this.isWatermarkElement(element)) {
      console.log('LibJitsiVideoCall: Removing watermark element from DOM:', element);
      element.remove();
      return;
    }
    
    // Otherwise, hide it with styles
    element.style.setProperty('display', 'none', 'important');
    element.style.setProperty('visibility', 'hidden', 'important');
    element.style.setProperty('opacity', '0', 'important');
    element.style.setProperty('width', '0', 'important');
    element.style.setProperty('height', '0', 'important');
    element.style.setProperty('position', 'absolute', 'important');
    element.style.setProperty('left', '-9999px', 'important');
    element.style.setProperty('top', '-9999px', 'important');
    element.style.setProperty('z-index', '-1', 'important');
    element.style.setProperty('pointer-events', 'none', 'important');
    element.style.setProperty('background', 'none', 'important');
    element.style.setProperty('background-image', 'none', 'important');
    element.style.setProperty('transform', 'scale(0)', 'important');
    element.style.setProperty('clip-path', 'inset(100%)', 'important');
  }

  /**
   * Check if an element is a watermark element
   */
  private isWatermarkElement(element: HTMLElement): boolean {
    const classList = element.classList;
    const hasWatermarkClass = classList.contains('watermark') || 
                             classList.contains('leftwatermark') || 
                             classList.contains('rightwatermark') ||
                             classList.contains('jitsi-watermark') ||
                             classList.contains('brand-watermark') ||
                             classList.contains('meet-watermark');
    
    const hasWatermarkInClass = Array.from(classList).some(cls => 
      cls.includes('watermark') || cls.includes('logo') || cls.includes('brand')
    );
    
    const hasWatermarkAria = element.getAttribute('aria-label')?.includes('Jitsi Meet Logo') || false;
    const hasJitsiHref = element.getAttribute('href')?.includes('jitsi.org') || false;
    const hasWatermarkSvg = element.getAttribute('style')?.includes('watermark.svg') || false;
    
    return hasWatermarkClass || hasWatermarkInClass || hasWatermarkAria || hasJitsiHref || hasWatermarkSvg;
  }

  /**
   * Try to inject CSS into the Jitsi iframe
   */
  private tryInjectIframeCSS() {
    try {
      const container = this.jitsiContainer?.nativeElement;
      if (!container) return;
      
      // Find the iframe
      const iframe = container.querySelector('iframe');
      if (!iframe) return;
      
      // Try to access iframe content (this will fail due to CORS, but we can try)
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          this.injectCSSIntoDocument(iframeDoc);
        }
      } catch (e) {
        // CORS error expected - iframe is from different domain
        console.log('LibJitsiVideoCall: Cannot access iframe content due to CORS');
      }
      
      // Alternative approach: try to execute script in iframe context
      try {
        iframe.contentWindow?.postMessage({
          type: 'HIDE_WATERMARKS',
          css: this.getWatermarkHidingCSS()
        }, '*');
      } catch (e) {
        console.log('LibJitsiVideoCall: Cannot post message to iframe');
      }
      
    } catch (error) {
      console.log('LibJitsiVideoCall: Error trying to inject iframe CSS:', error);
    }
  }

  /**
   * Inject CSS into a document
   */
  private injectCSSIntoDocument(doc: Document) {
    const styleId = 'jitsi-watermark-hider-iframe';
    
    // Remove existing style if it exists
    const existingStyle = doc.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create new style element
    const style = doc.createElement('style');
    style.id = styleId;
    style.textContent = this.getWatermarkHidingCSS();
    
    doc.head.appendChild(style);
  }

  /**
   * Get the watermark hiding CSS
   */
  private getWatermarkHidingCSS(): string {
    return `
      /* Hide all possible Jitsi watermarks - with maximum specificity */
      .watermark,
      .leftwatermark,
      .rightwatermark,
      .poweredby,
      .powered-by,
      .jitsi-watermark,
      .jitsi-logo,
      .jitsi-brand,
      .brand-watermark,
      .brand-logo,
      .meet-logo,
      .meet-watermark,
      [class*="watermark"],
      [class*="logo"],
      [class*="brand"],
      [class*="powered"],
      [id*="watermark"],
      [id*="logo"],
      [id*="brand"],
      [id*="powered"],
      .videocontainer .watermark,
      .videocontainer .leftwatermark,
      .videocontainer .rightwatermark,
      .videocontainer .poweredby,
      .videocontainer .jitsi-watermark,
      .videocontainer .jitsi-logo,
      .videocontainer .brand-watermark,
      .videocontainer .brand-logo,
      .videocontainer .meet-logo,
      .videocontainer .meet-watermark,
      /* Additional selectors for newer Jitsi versions */
      .leftwatermark,
      .rightwatermark,
      .watermark,
      .poweredby,
      .jitsi-watermark,
      .jitsi-logo,
      .brand-watermark,
      .brand-logo,
      .meet-logo,
      .meet-watermark,
      /* More specific selectors */
      div[class*="watermark"],
      div[class*="logo"],
      div[class*="brand"],
      div[class*="powered"],
      span[class*="watermark"],
      span[class*="logo"],
      span[class*="brand"],
      span[class*="powered"],
      img[class*="watermark"],
      img[class*="logo"],
      img[class*="brand"],
      img[class*="powered"],
      /* Target the specific watermark element we found */
      a.watermark.leftwatermark,
      a[class*="watermark"],
      a[class*="logo"],
      a[class*="brand"],
      a[class*="powered"],
      /* Target elements with inline styles */
      [style*="visibility: visible"][class*="watermark"],
      [style*="visibility: visible"][class*="logo"],
      [style*="visibility: visible"][class*="brand"],
      [style*="visibility: visible"][class*="powered"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        z-index: -1 !important;
        pointer-events: none !important;
        transform: scale(0) !important;
        clip-path: inset(100%) !important;
        clip: rect(0, 0, 0, 0) !important;
        background: none !important;
        background-image: none !important;
      }
    `;
  }

  /**
   * Try to overlay watermarks with CSS overlays
   */
  private tryOverlayWatermarks() {
    try {
      const container = this.jitsiContainer?.nativeElement;
      if (!container) return;
      
      // Find the iframe
      const iframe = container.querySelector('iframe');
      if (!iframe) return;
      
      // Create a comprehensive overlay that covers the entire iframe
      const overlayId = 'jitsi-watermark-overlay';
      let overlay = document.getElementById(overlayId);
      
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1000;
          background: transparent;
        `;
        
        // Add overlay to the container
        container.style.position = 'relative';
        container.appendChild(overlay);
      }
      
      // Create specific overlay elements for common watermark positions
      this.createWatermarkOverlays(overlay);
      
      // Create a full-screen overlay that covers the entire iframe area
      this.createFullScreenOverlay(overlay);
      
    } catch (error) {
      console.log('LibJitsiVideoCall: Error creating watermark overlays:', error);
    }
  }

  /**
   * Create a full-screen overlay that covers the entire iframe
   */
  private createFullScreenOverlay(parent: HTMLElement) {
    const fullScreenOverlayId = 'jitsi-fullscreen-watermark-overlay';
    let fullScreenOverlay = document.getElementById(fullScreenOverlayId);
    
    if (!fullScreenOverlay) {
      fullScreenOverlay = document.createElement('div');
      fullScreenOverlay.id = fullScreenOverlayId;
      fullScreenOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1002;
        background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.1) 0%,
          transparent 10%,
          transparent 90%,
          rgba(0, 0, 0, 0.1) 100%
        );
      `;
      parent.appendChild(fullScreenOverlay);
    }
  }

  /**
   * Create specific overlay elements for watermark positions
   */
  private createWatermarkOverlays(parent: HTMLElement) {
    // More aggressive overlay positions to cover the watermark area completely
    const overlayPositions = [
      { id: 'watermark-overlay-top-left', top: '0px', left: '0px', width: '200px', height: '60px' },
      { id: 'watermark-overlay-top-right', top: '0px', right: '0px', width: '200px', height: '60px' },
      { id: 'watermark-overlay-bottom-left', bottom: '0px', left: '0px', width: '200px', height: '60px' },
      { id: 'watermark-overlay-bottom-right', bottom: '0px', right: '0px', width: '200px', height: '60px' },
      { id: 'watermark-overlay-center-bottom', bottom: '0px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '60px' },
      // Additional overlays for common watermark positions
      { id: 'watermark-overlay-top-center', top: '0px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '60px' },
      { id: 'watermark-overlay-left-center', top: '50%', left: '0px', transform: 'translateY(-50%)', width: '200px', height: '60px' },
      { id: 'watermark-overlay-right-center', top: '50%', right: '0px', transform: 'translateY(-50%)', width: '200px', height: '60px' }
    ];
    
    overlayPositions.forEach(pos => {
      let overlay = document.getElementById(pos.id);
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = pos.id;
        overlay.style.cssText = `
          position: absolute;
          background: rgba(0, 0, 0, 0.9);
          border-radius: 0px;
          pointer-events: none;
          z-index: 1001;
          ${pos.top ? `top: ${pos.top};` : ''}
          ${pos.bottom ? `bottom: ${pos.bottom};` : ''}
          ${pos.left ? `left: ${pos.left};` : ''}
          ${pos.right ? `right: ${pos.right};` : ''}
          ${pos.width ? `width: ${pos.width};` : ''}
          ${pos.height ? `height: ${pos.height};` : ''}
          ${pos.transform ? `transform: ${pos.transform};` : ''}
        `;
        parent.appendChild(overlay);
      }
    });
  }

  /**
   * Try to intercept watermark creation by overriding iframe content
   */
  private tryInterceptWatermarkCreation() {
    try {
      const container = this.jitsiContainer?.nativeElement;
      if (!container) return;
      
      const iframe = container.querySelector('iframe');
      if (!iframe) return;
      
      // Try to override the iframe's onload to inject our CSS
      if (iframe.contentWindow) {
        try {
          // Try to inject a script that will hide watermarks
          const script = `
            (function() {
              // Hide watermarks immediately
              function hideWatermarks() {
                const selectors = [
                  'a.watermark.leftwatermark',
                  'a[aria-label*="Jitsi Meet Logo"]',
                  'a[href*="jitsi.org"]',
                  '[style*="watermark.svg"]',
                  '.watermark',
                  '.leftwatermark',
                  '.rightwatermark'
                ];
                
                selectors.forEach(selector => {
                  const elements = document.querySelectorAll(selector);
                  elements.forEach(el => {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.opacity = '0';
                    el.remove();
                  });
                });
              }
              
              // Hide watermarks immediately and on DOM changes
              hideWatermarks();
              setInterval(hideWatermarks, 1000);
              
              // Also listen for DOM changes
              const observer = new MutationObserver(hideWatermarks);
              observer.observe(document.body, { childList: true, subtree: true });
            })();
          `;
          
          iframe.contentWindow.eval(script);
        } catch (e) {
          // CORS error expected
          console.log('LibJitsiVideoCall: Cannot inject script into iframe due to CORS');
        }
      }
      
    } catch (error) {
      console.log('LibJitsiVideoCall: Error intercepting watermark creation:', error);
    }
  }

  /**
   * Try to use Jitsi API commands to hide watermarks
   */
  private tryJitsiWatermarkCommands() {
    if (!this.jitsiApi) return;
    
    try {
      // Try various commands that might hide watermarks
      const commands = [
        'toggleWatermark',
        'hideWatermark',
        'hideBranding',
        'hideLogo',
        'disableWatermark',
        'disableBranding',
        'disableLogo',
        'toggleBranding',
        'toggleLogo'
      ];
      
      commands.forEach(command => {
        try {
          this.jitsiApi.executeCommand(command);
          console.log(`LibJitsiVideoCall: Executed command: ${command}`);
        } catch (e) {
          // Command doesn't exist, that's fine
        }
      });
      
      // Try to set interface config after joining
      setTimeout(() => {
        try {
          this.jitsiApi.executeCommand('setInterfaceConfig', {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_POWERED_BY: false,
            SHOW_POLICY_WATERMARK: false,
            SHOW_LOGO: false,
            SHOW_BRAND: false,
            SHOW_JITSI_LOGO: false,
            SHOW_BRAND_LOGO: false,
            SHOW_MEET_LOGO: false,
            SHOW_MEET_WATERMARK: false,
            SHOW_LEFT_WATERMARK: false,
            SHOW_RIGHT_WATERMARK: false,
            SHOW_POWERED_BY_JITSI: false,
            SHOW_POWERED_BY_LOGO: false,
            DISABLE_BRANDING: true,
            DISABLE_WATERMARKS: true,
            DISABLE_LOGO: true
          });
          console.log('LibJitsiVideoCall: Set interface config to hide watermarks');
        } catch (e) {
          console.log('LibJitsiVideoCall: Could not set interface config:', e);
        }
      }, 2000);
      
    } catch (error) {
      console.log('LibJitsiVideoCall: Error executing watermark commands:', error);
    }
  }

  /**
   * Clean up injected watermark hiding CSS and overlays
   */
  private cleanupWatermarkHidingCSS() {
    const styleId = 'jitsi-watermark-hider';
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Clean up overlays
    const overlayIds = [
      'jitsi-watermark-overlay',
      'jitsi-fullscreen-watermark-overlay',
      'watermark-overlay-top-left',
      'watermark-overlay-top-right',
      'watermark-overlay-bottom-left',
      'watermark-overlay-bottom-right',
      'watermark-overlay-center-bottom',
      'watermark-overlay-top-center',
      'watermark-overlay-left-center',
      'watermark-overlay-right-center'
    ];
    
    overlayIds.forEach(id => {
      const overlay = document.getElementById(id);
      if (overlay) {
        overlay.remove();
      }
    });
  }
}
