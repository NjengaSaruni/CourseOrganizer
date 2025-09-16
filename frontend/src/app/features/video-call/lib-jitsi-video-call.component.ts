import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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

  // Meeting controls state
  isAudioMuted: boolean = false;
  isVideoMuted: boolean = false;
  isScreenSharing: boolean = false;
  isChatOpen: boolean = false;
  isParticipantsOpen: boolean = false;

  ngOnInit() {
    this.loadJitsiMeetScript();
  }

  ngAfterViewInit() {
    // Component is ready, but we'll wait for the script to load
  }

  ngOnDestroy() {
    console.log('LibJitsiVideoCall: Component destroying, disposing API');
    if (this.jitsiApi) {
      console.log('LibJitsiVideoCall: Disposing Jitsi API');
      this.jitsiApi.dispose();
      this.jitsiApi = null;
    }
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
        userInfo: this.userInfo,
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
          enableP2P: true,
          p2p: {
            enabled: true,
            stunServers: [
              { urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443' }
            ]
          }
        },
        interfaceConfigOverwrite: {
          // Custom interface configuration
          APP_NAME: 'RiverLearn',
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_POWERED_BY: false,
          SHOW_POLICY_WATERMARK: false,
          SHOW_LOBBY_BUTTON: true,
          SHOW_MEETING_TIMER: true,
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
          SHOW_ABOUT_DEVICE_PAGE: false,
          SHOW_ABOUT_NETWORK_PAGE: false,
          SHOW_ABOUT_AUDIO_PAGE: false,
          SHOW_ABOUT_VIDEO_PAGE: false,
          SHOW_ABOUT_MORE_PAGE: false,
          SHOW_ABOUT_DEVICE_MORE_PAGE: false,
          SHOW_ABOUT_NETWORK_MORE_PAGE: false,
          SHOW_ABOUT_AUDIO_MORE_PAGE: false,
          SHOW_ABOUT_VIDEO_MORE_PAGE: false,
          SHOW_ABOUT_MORE_MORE_PAGE: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
          ],
          SETTINGS_SECTIONS: [
            'devices', 'language', 'moderator', 'profile', 'calendar', 'sounds', 'more'
          ]
        }
      };

      this.jitsiApi = new window.JitsiMeetExternalAPI(this.domain, config);

      // Event listeners
      this.jitsiApi.addListener('videoConferenceJoined', () => {
        console.log('LibJitsiVideoCall: Joined video conference');
        this.isLoading = false;
        this.error = null;
      });

      this.jitsiApi.addListener('videoConferenceLeft', () => {
        console.log('LibJitsiVideoCall: Left video conference - emitting meetingEnded event');
        this.meetingEnded.emit();
      });

      // Add more event listeners for debugging
      this.jitsiApi.addListener('readyToClose', () => {
        console.log('LibJitsiVideoCall: readyToClose event received');
        this.meetingEnded.emit();
      });

      this.jitsiApi.addListener('hangup', () => {
        console.log('LibJitsiVideoCall: hangup event received');
        this.meetingEnded.emit();
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
      this.jitsiApi.executeCommand('hangup');
    }
    // Also emit the meeting ended event immediately
    console.log('Emitting meetingEnded event from leaveMeeting');
    this.meetingEnded.emit();
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
    if (this.jitsiApi) {
      this.jitsiApi.dispose();
      this.jitsiApi = null;
    }
    this.meetingEnded.emit();
  }
}
