import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CourseService } from './course.service';
import { LibJitsiCallService, LibJitsiCallData } from './lib-jitsi-call.service';

export interface VideoCallResponse {
  meeting_id: number;
  join_url: string;
  meeting_title: string;
  user_name: string;
  admin_host: string;
  platform: string;
  daily_token?: string;
  daily_room_name?: string;
  timetable_entry?: any;
}

@Injectable({
  providedIn: 'root'
})
export class VideoCallService {
  private apiUrl = environment.apiUrl;
  private videoCallModal: HTMLElement | null = null;
  private currentCallFrame: any = null;
  private pendingVideoCallData: VideoCallResponse | null = null;

  constructor(
    private http: HttpClient, 
    private courseService: CourseService,
    private libJitsiCallService: LibJitsiCallService
  ) {}

  /**
   * Start a Lib-Jitsi-Meet video call (new implementation)
   */
  startLibJitsiCall(videoCallData: VideoCallResponse): void {
    console.log('Starting Lib-Jitsi-Meet call with data:', videoCallData);
    
    // Extract room name from URL or generate one
    let roomName = this.extractRoomNameFromUrl(videoCallData.join_url);
    if (!roomName) {
      roomName = `meeting-${videoCallData.meeting_id}-${Date.now()}`;
    }

    // Create user info
    const userInfo = {
      displayName: videoCallData.user_name || 'User',
      email: '', // Add email if available
      avatar: '' // Add avatar if available
    };

    // Create call data
    const callData: LibJitsiCallData = {
      roomName: roomName,
      meetingTitle: videoCallData.meeting_title || 'Video Meeting',
      userInfo: userInfo,
      meetingId: videoCallData.meeting_id
    };

    // Start the call using the service
    this.libJitsiCallService.startCall(callData);
  }

  /**
   * Check if Daily.co SDK is properly loaded
   */
  isDailyCoAvailable(): boolean {
    return typeof (window as any).DailyIframe !== 'undefined';
  }

  /**
   * Check if the browser supports media devices and permissions
   */
  isMediaDevicesSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Check if we're in a secure context (required for camera access)
   */
  isSecureContext(): boolean {
    return window.isSecureContext;
  }

  /**
   * Get detailed information about media device support
   */
  getMediaDeviceInfo(): any {
    return {
      isSecureContext: this.isSecureContext(),
      isMediaDevicesSupported: this.isMediaDevicesSupported(),
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      hostname: window.location.hostname
    };
  }

  /**
   * Ensure iframe has proper permissions for camera and microphone access
   */
  private ensureIframePermissions(iframe: HTMLIFrameElement): void {
    // Set iframe permissions for camera and microphone access
    iframe.setAttribute('allow', 'camera; microphone; autoplay; fullscreen; display-capture');
    iframe.setAttribute('allowfullscreen', 'true');
    
    // Additional attributes for better compatibility
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation');
    
    console.log('Iframe permissions set:', {
      allow: iframe.getAttribute('allow'),
      allowfullscreen: iframe.getAttribute('allowfullscreen'),
      sandbox: iframe.getAttribute('sandbox')
    });
  }

  /**
   * Public method to request media permissions (can be called independently)
   */
  requestMediaPermissions(): Promise<MediaStream | null> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Media devices API not supported');
      return Promise.resolve(null);
    }

    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      console.warn('Not in a secure context - camera access may be restricted');
      return Promise.resolve(null);
    }

    console.log('Requesting media permissions...');
    
    return navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    }).then(stream => {
      console.log('Media permissions granted');
      
      // Don't stop the stream immediately for public method - let caller decide
      return stream;
    }).catch(err => {
      console.warn('Media permissions denied or error:', err);
      return null;
    });
  }

  /**
   * Request media permissions with user guidance
   */
  private requestMediaPermissionsWithGuidance(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Media devices API not supported');
        resolve(false);
        return;
      }

      console.log('Requesting media permissions...');
      
      navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      }).then(stream => {
        console.log('Media permissions granted');
        
        // Stop the stream immediately since we just wanted to get permission
        stream.getTracks().forEach(track => track.stop());
        
        resolve(true);
      }).catch(err => {
        console.warn('Media permissions denied or error:', err);
        resolve(false);
      });
    });
  }

  /**
   * Request media permissions upfront for better user experience (internal method)
   */
  private requestMediaPermissionsInternal(): void {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Media devices API not supported');
      this.updatePermissionStatus('Media devices API not supported', 'warning');
      return;
    }

    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      console.warn('Not in a secure context - camera access may be restricted');
      this.updatePermissionStatus('Camera access requires HTTPS or localhost', 'warning');
      this.showPermissionMessage('Camera and microphone access requires a secure connection (HTTPS). Please ensure you are using HTTPS.', 'warning');
      return;
    }

    console.log('Requesting media permissions...');
    
    navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    }).then(stream => {
      console.log('Media permissions granted');
      
      // Stop the stream immediately since we just wanted to get permission
      stream.getTracks().forEach(track => track.stop());
      
      // Update permission status
      this.updatePermissionStatus('Camera and microphone access granted!', 'success');
      
      // Show a brief permission granted message
      this.showPermissionMessage('Camera and microphone access granted!', 'success');
    }).catch(err => {
      console.warn('Media permissions denied or error:', err);
      
      let message = 'Camera and microphone access denied. ';
      let statusMessage = 'Permissions denied';
      
      if (err.name === 'NotAllowedError') {
        message += 'Please allow camera and microphone access in your browser settings and refresh the page.';
        statusMessage = 'Please allow camera and microphone access';
      } else if (err.name === 'NotFoundError') {
        message += 'No camera or microphone found. Please check your devices.';
        statusMessage = 'No camera or microphone found';
      } else if (err.name === 'NotSupportedError') {
        message += 'Camera and microphone access is not supported in this browser.';
        statusMessage = 'Camera access not supported';
      } else if (err.name === 'NotReadableError') {
        message += 'Camera or microphone is already in use by another application.';
        statusMessage = 'Camera/microphone in use';
      } else {
        message += 'Please check your browser permissions and device settings.';
        statusMessage = 'Permission error occurred';
      }
      
      this.updatePermissionStatus(statusMessage, 'warning');
      this.showPermissionMessage(message, 'warning');
    });
  }

  /**
   * Update permission status in the loading screen
   */
  private updatePermissionStatus(message: string, type: 'success' | 'warning' | 'error'): void {
    const statusElement = document.getElementById('permission-status');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.style.color = type === 'success' ? '#28a745' : 
                                  type === 'warning' ? '#ffc107' : '#dc3545';
    }
  }

  /**
   * Show a brief permission message to the user
   */
  private showPermissionMessage(message: string, type: 'success' | 'warning' | 'error'): void {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#dc3545'};
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      z-index: 10001;
      max-width: 400px;
      font-size: 14px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove notification after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 4000);
  }

  /**
   * Show detailed permission guidance modal
   */
  private showPermissionGuidance(): void {
    // Remove existing modal if it exists
    this.closeVideoCallModal();

    const modal = document.createElement('div');
    modal.id = 'permission-guidance-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    `;

    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="width: 64px; height: 64px; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
          <svg style="width: 32px; height: 32px; color: #f59e0b;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 style="margin: 0 0 0.5rem; color: #1f2937; font-size: 1.5rem; font-weight: 600;">Camera Access Required</h2>
        <p style="margin: 0; color: #6b7280; font-size: 1rem;">To join the video call, you need to allow camera and microphone access.</p>
      </div>

      <div style="margin-bottom: 2rem;">
        <h3 style="margin: 0 0 1rem; color: #1f2937; font-size: 1.125rem; font-weight: 600;">How to enable camera access:</h3>
        
        <div style="background: #f9fafb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; color: #374151; font-size: 1rem; font-weight: 600;">Chrome/Edge:</h4>
          <ol style="margin: 0; padding-left: 1.5rem; color: #6b7280; font-size: 0.875rem; line-height: 1.5;">
            <li>Click the camera icon in the address bar</li>
            <li>Select "Allow" for camera and microphone</li>
            <li>Refresh the page</li>
          </ol>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; color: #374151; font-size: 1rem; font-weight: 600;">Firefox:</h4>
          <ol style="margin: 0; padding-left: 1.5rem; color: #6b7280; font-size: 0.875rem; line-height: 1.5;">
            <li>Click the shield icon in the address bar</li>
            <li>Click "Allow" for camera and microphone</li>
            <li>Refresh the page</li>
          </ol>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.5rem; color: #374151; font-size: 1rem; font-weight: 600;">Safari:</h4>
          <ol style="margin: 0; padding-left: 1.5rem; color: #6b7280; font-size: 0.875rem; line-height: 1.5;">
            <li>Go to Safari > Preferences > Websites</li>
            <li>Select "Camera" and "Microphone"</li>
            <li>Set this website to "Allow"</li>
            <li>Refresh the page</li>
          </ol>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; justify-content: flex-end;">
        <button id="retry-permissions" style="
          padding: 0.75rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        ">Try Again</button>
        <button id="join-audio-only" style="
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          background: #3b82f6;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        ">Join Audio Only</button>
        <button id="close-guidance" style="
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          background: #dc2626;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        ">Cancel</button>
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Add event listeners
    const retryButton = content.querySelector('#retry-permissions');
    const audioOnlyButton = content.querySelector('#join-audio-only');
    const closeButton = content.querySelector('#close-guidance');

    retryButton?.addEventListener('click', () => {
      document.body.removeChild(modal);
      // Trigger permission request again
      this.requestMediaPermissionsWithGuidance().then(hasPermissions => {
        if (hasPermissions && this.pendingVideoCallData) {
          // Re-trigger the video call with stored data
          this.proceedWithVideoCall(this.pendingVideoCallData);
        } else {
          this.showPermissionGuidance();
        }
      });
    });

    audioOnlyButton?.addEventListener('click', () => {
      document.body.removeChild(modal);
      // Join with audio only
      if (this.pendingVideoCallData) {
        this.joinAudioOnly(this.pendingVideoCallData);
      }
    });

    closeButton?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  /**
   * Join a meeting for a specific timetable entry
   */
  joinTimetableMeeting(timetableEntryId: number): Observable<VideoCallResponse> {
    return this.http.post<VideoCallResponse>(`${this.apiUrl}/timetable/${timetableEntryId}/join-meeting/`, {}).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Join a specific meeting by ID
   */
  joinMeeting(meetingId: number): Observable<VideoCallResponse> {
    return this.http.post<VideoCallResponse>(`${this.apiUrl}/meetings/${meetingId}/join/`, {}).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Create a video call for a timetable entry
   */
  createVideoCallForTimetable(timetableEntryId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/timetable/${timetableEntryId}/create-meeting/`, {}).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Delete a video call for a timetable entry
   */
  deleteVideoCallForTimetable(timetableEntryId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/timetable/${timetableEntryId}/delete-meeting/`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Open video call embedded in the app
   */
  openVideoCall(videoCallData: VideoCallResponse): void {
    // Store the video call data for potential retry
    this.pendingVideoCallData = videoCallData;

    // Check prerequisites first
    if (!this.isSecureContext()) {
      alert('Camera and microphone access requires a secure connection (HTTPS). Please ensure you are using HTTPS.');
      return;
    }

    if (!this.isMediaDevicesSupported()) {
      alert('Your browser does not support camera and microphone access. Please use a modern browser.');
      return;
    }

    // Request permissions first
    this.requestMediaPermissionsWithGuidance().then(hasPermissions => {
      if (hasPermissions) {
        this.proceedWithVideoCall(videoCallData);
      } else {
        // User denied permissions, show guidance
        this.showPermissionGuidance();
      }
    });
  }

  /**
   * Open video call embedded in the page header (new method)
   */
  openEmbeddedVideoCall(videoCallData: VideoCallResponse): void {
    // Store the video call data for potential retry
    this.pendingVideoCallData = videoCallData;

    // Check prerequisites first
    if (!this.isSecureContext()) {
      alert('Camera and microphone access requires a secure connection (HTTPS). Please ensure you are using HTTPS.');
      return;
    }

    if (!this.isMediaDevicesSupported()) {
      alert('Your browser does not support camera and microphone access. Please use a modern browser.');
      return;
    }

    // Request permissions first
    this.requestMediaPermissionsWithGuidance().then(hasPermissions => {
      if (hasPermissions) {
        this.createEmbeddedVideoCall(videoCallData);
      } else {
        // User denied permissions, show guidance
        this.showPermissionGuidance();
      }
    });
  }

  /**
   * Proceed with video call after permissions are granted
   */
  private proceedWithVideoCall(videoCallData: VideoCallResponse): void {
    // Determine the actual platform based on the URL, not just the platform field
    const isDailyUrl = videoCallData.join_url && videoCallData.join_url.includes('daily.co');
    const isJitsiUrl = videoCallData.join_url && (videoCallData.join_url.includes('meet.jit.si') || videoCallData.join_url.includes('jitsi.riverlearn.co.ke'));
    const isRiverLearnJitsi = videoCallData.join_url && videoCallData.join_url.includes('jitsi.riverlearn.co.ke');
    
    console.log('Video call platform detection:', {
      declaredPlatform: videoCallData.platform,
      isDailyUrl,
      isJitsiUrl,
      isRiverLearnJitsi,
      joinUrl: videoCallData.join_url
    });

    if (isRiverLearnJitsi) {
      // Use Lib-Jitsi-Meet for our self-hosted server
      console.log('Using Lib-Jitsi-Meet for RiverLearn server');
      this.startLibJitsiCall(videoCallData);
    } else if (videoCallData.platform === 'daily' && isDailyUrl && this.isDailyCoAvailable()) {
      this.embedDailyCall(videoCallData);
    } else {
      // Use iframe Jitsi for other Jitsi URLs
      console.log('Using iframe Jitsi call method');
      this.embedJitsiCall(videoCallData);
    }
  }

  /**
   * Join video call with audio only (fallback when camera is denied)
   */
  private joinAudioOnly(videoCallData: VideoCallResponse): void {
    // Request only microphone permission
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Microphone access is not supported in this browser.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ 
      video: false, 
      audio: true 
    }).then(stream => {
      console.log('Audio permission granted, joining audio only');
      
      // Stop the stream immediately since we just wanted to get permission
      stream.getTracks().forEach(track => track.stop());
      
      // Proceed with audio-only call
      this.proceedWithVideoCall(videoCallData);
    }).catch(err => {
      console.warn('Audio permission denied:', err);
      alert('Microphone access is required for audio-only calls. Please allow microphone access and try again.');
    });
  }

  /**
   * Embed Daily.co video call in the app
   */
  private embedDailyCall(videoCallData: VideoCallResponse): void {
    // Check if DailyIframe is available
    if (typeof (window as any).DailyIframe === 'undefined') {
      console.error('DailyIframe not loaded. Please ensure the Daily.co SDK is included.');
      alert('Video call service not available. Please refresh the page and try again.');
      return;
    }

    this.createVideoCallModal(videoCallData);
  }

  /**
   * Embed Jitsi video call in the app
   */
  private embedJitsiCall(videoCallData: VideoCallResponse): void {
    this.createVideoCallModal(videoCallData);
  }

  /**
   * Create embedded video call in page header
   */
  private createEmbeddedVideoCall(videoCallData: VideoCallResponse): void {
    // Check if this is our self-hosted Jitsi server
    const isRiverLearnJitsi = videoCallData.join_url && videoCallData.join_url.includes('jitsi.riverlearn.co.ke');
    
    if (isRiverLearnJitsi) {
      // Use Lib-Jitsi-Meet component for our self-hosted server
      console.log('Using Lib-Jitsi-Meet for RiverLearn server');
      this.startLibJitsiCall(videoCallData);
      return;
    }

    // Remove existing embedded call if it exists
    this.closeEmbeddedVideoCall();

    // Find the page header container
    const headerContainer = document.querySelector('.bg-white.shadow-sm.border-b.border-gray-200');
    if (!headerContainer) {
      console.error('Could not find page header container');
      return;
    }

    // Create embedded video call container
    const videoContainer = document.createElement('div');
    videoContainer.id = 'embedded-video-call';
    videoContainer.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 500px;
      height: 400px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border: 1px solid #e5e7eb;
      resize: both;
      overflow: hidden;
      min-width: 300px;
      min-height: 200px;
      max-width: 90vw;
      max-height: 80vh;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      background: #f8fafc;
      color: #1f2937;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e5e7eb;
      border-radius: 12px 12px 0 0;
      cursor: move;
      user-select: none;
    `;

    const title = document.createElement('div');
    title.style.cssText = 'font-size: 14px; font-weight: 600; flex: 1;';
    title.textContent = videoCallData.meeting_title || 'Video Call';

    // Create control buttons container
    const controlButtons = document.createElement('div');
    controlButtons.style.cssText = 'display: flex; gap: 8px; align-items: center;';

    // Fullscreen button
    const fullscreenButton = document.createElement('button');
    fullscreenButton.innerHTML = '⛶';
    fullscreenButton.title = 'Fullscreen';
    fullscreenButton.style.cssText = `
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    fullscreenButton.onclick = () => this.toggleEmbeddedFullscreen();

    // Resize button
    const resizeButton = document.createElement('button');
    resizeButton.innerHTML = '⤢';
    resizeButton.title = 'Resize';
    resizeButton.style.cssText = `
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    resizeButton.onclick = () => this.toggleEmbeddedResize();

    // Close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.title = 'Close';
    closeButton.style.cssText = `
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeButton.onclick = () => this.closeEmbeddedVideoCall();

    controlButtons.appendChild(fullscreenButton);
    controlButtons.appendChild(resizeButton);
    controlButtons.appendChild(closeButton);

    header.appendChild(title);
    header.appendChild(controlButtons);

    // Create video area
    const videoArea = document.createElement('div');
    videoArea.id = 'embedded-video-area';
    videoArea.style.cssText = `
      flex: 1;
      position: relative;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create loading spinner
    const loading = document.createElement('div');
    loading.id = 'embedded-video-loading';
    loading.style.cssText = `
      text-align: center;
      color: white;
    `;
    loading.innerHTML = `
      <div style="
        width: 32px;
        height: 32px;
        border: 3px solid #444;
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 8px;
      "></div>
      <div style="font-size: 12px;">Connecting...</div>
    `;

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'embedded-video-frame';
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      display: none;
    `;
    // Add iframe permissions for camera and microphone access
    iframe.setAttribute('allow', 'camera; microphone; autoplay; fullscreen; display-capture');
    iframe.setAttribute('allowfullscreen', 'true');

    videoArea.appendChild(loading);
    videoArea.appendChild(iframe);

    // Create controls
    const controls = document.createElement('div');
    controls.style.cssText = `
      background: #f8fafc;
      padding: 8px 12px;
      display: flex;
      justify-content: center;
      gap: 8px;
      border-top: 1px solid #e5e7eb;
      border-radius: 0 0 12px 12px;
    `;

    const minimizeButton = document.createElement('button');
    minimizeButton.innerHTML = '−';
    minimizeButton.title = 'Minimize';
    minimizeButton.style.cssText = `
      padding: 4px 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      background: white;
      color: #374151;
    `;
    minimizeButton.onclick = () => this.minimizeEmbeddedVideoCall();

    const leaveButton = document.createElement('button');
    leaveButton.textContent = 'Leave';
    leaveButton.title = 'Leave Meeting';
    leaveButton.style.cssText = `
      padding: 4px 8px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      background: #ef4444;
      color: white;
    `;
    leaveButton.onclick = () => this.closeEmbeddedVideoCall();

    controls.appendChild(minimizeButton);
    controls.appendChild(leaveButton);

    // Assemble container
    videoContainer.appendChild(header);
    videoContainer.appendChild(videoArea);
    videoContainer.appendChild(controls);

    // Add to page
    document.body.appendChild(videoContainer);
    this.videoCallModal = videoContainer;

    // Add drag functionality to header
    this.addDragFunctionality(header, videoContainer);

    // Initialize the video call
    this.initializeEmbeddedVideoCall(videoCallData, iframe, loading);
  }

  /**
   * Create embedded video call modal
   */
  private createVideoCallModal(videoCallData: VideoCallResponse): void {
    // Remove existing modal if it exists
    this.closeVideoCallModal();

    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'video-call-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      background: #2d2d2d;
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #444;
    `;

    const title = document.createElement('h2');
    title.textContent = videoCallData.meeting_title || 'Video Call';
    title.style.cssText = 'margin: 0; font-size: 1.2rem; font-weight: 600;';

    const userInfo = document.createElement('div');
    userInfo.textContent = `${videoCallData.user_name} ${videoCallData.admin_host ? `• Host: ${videoCallData.admin_host}` : ''}`;
    userInfo.style.cssText = 'font-size: 0.9rem; opacity: 0.8;';

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeButton.onclick = () => this.closeVideoCallModal();

    header.appendChild(title);
    header.appendChild(userInfo);
    header.appendChild(closeButton);

    // Create video container
    const videoContainer = document.createElement('div');
    videoContainer.id = 'video-call-container';
    videoContainer.style.cssText = `
      flex: 1;
      position: relative;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create loading spinner
    const loading = document.createElement('div');
    loading.id = 'video-loading';
    loading.style.cssText = `
      text-align: center;
      color: white;
    `;
    loading.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        border: 4px solid #444;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      "></div>
      <div>Connecting to video call...</div>
      <div id="permission-status" style="
        font-size: 12px;
        opacity: 0.8;
        margin-top: 8px;
        color: #ccc;
      ">Checking camera and microphone permissions...</div>
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'video-call-frame';
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      display: none;
    `;
    // Add iframe permissions for camera and microphone access
    iframe.setAttribute('allow', 'camera; microphone; autoplay; fullscreen; display-capture');
    iframe.setAttribute('allowfullscreen', 'true');

    videoContainer.appendChild(loading);
    videoContainer.appendChild(iframe);

    // Create controls
    const controls = document.createElement('div');
    controls.style.cssText = `
      background: #2d2d2d;
      padding: 1rem;
      display: flex;
      justify-content: center;
      gap: 1rem;
      border-top: 1px solid #444;
    `;

    const fullscreenButton = document.createElement('button');
    fullscreenButton.textContent = 'Fullscreen';
    fullscreenButton.style.cssText = `
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      background: #007bff;
      color: white;
    `;
    fullscreenButton.onclick = () => this.toggleFullscreen();

    const leaveButton = document.createElement('button');
    leaveButton.textContent = 'Leave Call';
    leaveButton.style.cssText = `
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      background: #dc3545;
      color: white;
    `;
    leaveButton.onclick = () => this.closeVideoCallModal();

    controls.appendChild(fullscreenButton);
    controls.appendChild(leaveButton);

    // Assemble modal
    modal.appendChild(header);
    modal.appendChild(videoContainer);
    modal.appendChild(controls);

    // Add to page
    document.body.appendChild(modal);
    this.videoCallModal = modal;

    // Initialize the video call
    this.initializeEmbeddedVideoCall(videoCallData, iframe, loading);
  }


  /**
   * Initialize embedded video call
   */
  private initializeEmbeddedVideoCall(videoCallData: VideoCallResponse, iframe: HTMLIFrameElement, loading: HTMLElement): void {
    // Determine the actual platform based on the URL, not just the platform field
    const isDailyUrl = videoCallData.join_url && videoCallData.join_url.includes('daily.co');
    const isJitsiUrl = videoCallData.join_url && (videoCallData.join_url.includes('meet.jit.si') || videoCallData.join_url.includes('jitsi.riverlearn.co.ke'));
    
    console.log('Platform detection:', {
      declaredPlatform: videoCallData.platform,
      isDailyUrl,
      isJitsiUrl,
      joinUrl: videoCallData.join_url
    });

    if (videoCallData.platform === 'daily' && isDailyUrl) {
      this.initializeEmbeddedDailyCall(videoCallData, iframe, loading);
    } else {
      // Use Jitsi for any non-Daily URL or when Daily URL is not available
      this.initializeEmbeddedJitsiCall(videoCallData, iframe, loading);
    }
  }

  /**
   * Initialize embedded Daily.co call
   */
  private initializeEmbeddedDailyCall(videoCallData: VideoCallResponse, iframe: HTMLIFrameElement, loading: HTMLElement): void {
    console.log('Initializing Daily.co call with data:', videoCallData);
    // Set up timeout for connection
    const connectionTimeout = setTimeout(() => {
      loading.innerHTML = `
        <div style="color: #ff6b6b; text-align: center;">
          <h3>Connection Timeout</h3>
          <p>Failed to connect after 30 seconds. Please try again.</p>
          <button onclick="location.reload()" style="
            padding: 0.5rem 1rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
          ">Retry</button>
        </div>
      `;
    }, 30000);

    try {
      // Validate URL before creating frame
      if (!videoCallData.join_url || videoCallData.join_url.trim() === '') {
        console.warn('Daily.co URL is empty, falling back to Jitsi');
        this.initializeEmbeddedJitsiCall(videoCallData, iframe, loading);
        return;
      }

      console.log('Creating Daily.co frame with URL:', videoCallData.join_url);

      // Ensure iframe has proper permissions
      this.ensureIframePermissions(iframe);

      // Create Daily.co call frame
      this.currentCallFrame = (window as any).DailyIframe.createFrame(iframe, {
        showLeaveButton: false, // We'll handle this with our own controls
        showFullscreenButton: false,
        showLocalVideo: true,
        showParticipantsBar: true,
        showChatButton: true,
        showCameraButton: true,
        showMicrophoneButton: true,
        showScreenShareButton: true,
        showHangupButton: false,
        colors: {
          accent: '#007bff',
          accentText: '#ffffff',
          background: '#1a1a1a',
          backgroundAccent: '#2d2d2d',
          baseText: '#ffffff',
          border: '#444444',
          mainAreaBg: '#000000',
          supportiveText: '#cccccc'
        }
      });

      // Set up event listeners
      this.currentCallFrame
        .on('joined-meeting', () => {
          console.log('Joined Daily.co meeting successfully');
          clearTimeout(connectionTimeout);
          loading.style.display = 'none';
          iframe.style.display = 'block';
        })
        .on('left-meeting', () => {
          console.log('Left Daily.co meeting');
          this.closeVideoCallModal();
        })
        .on('error', (error: any) => {
          console.error('Daily.co error:', error);
          clearTimeout(connectionTimeout);
          loading.innerHTML = `
            <div style="color: #ff6b6b; text-align: center;">
              <h3>Connection Error</h3>
              <p>Failed to connect to video call. Please try again.</p>
              <button onclick="location.reload()" style="
                padding: 0.5rem 1rem;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                margin-top: 1rem;
              ">Retry</button>
            </div>
          `;
        });

      // Join the meeting
      const joinConfig: any = {
        url: videoCallData.join_url,
        userName: videoCallData.user_name
      };

      if (videoCallData.daily_token) {
        joinConfig.token = videoCallData.daily_token;
      }

      console.log('Joining Daily.co meeting with config:', joinConfig);
      this.currentCallFrame.join(joinConfig);

    } catch (error) {
      console.error('Failed to initialize Daily.co call:', error);
      clearTimeout(connectionTimeout);
      loading.innerHTML = `
        <div style="color: #ff6b6b; text-align: center;">
          <h3>Initialization Error</h3>
          <p>Failed to initialize video call. Please try again.</p>
          <button onclick="location.reload()" style="
            padding: 0.5rem 1rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
          ">Retry</button>
        </div>
      `;
    }
  }

  /**
   * Initialize embedded Jitsi call
   */
  private initializeEmbeddedJitsiCall(videoCallData: VideoCallResponse, iframe: HTMLIFrameElement, loading: HTMLElement): void {
    console.log('Initializing Jitsi call with data:', videoCallData);
    
    // Set up timeout for connection
    const connectionTimeout = setTimeout(() => {
      loading.innerHTML = `
        <div style="color: #ff6b6b; text-align: center;">
          <h3>Connection Timeout</h3>
          <p>Failed to connect after 30 seconds. Please try again.</p>
          <button onclick="location.reload()" style="
            padding: 0.5rem 1rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
          ">Retry</button>
        </div>
      `;
    }, 30000);

    // Ensure iframe has proper permissions
    this.ensureIframePermissions(iframe);

    // Generate JWT token for authenticated Jitsi access
    this.generateJitsiTokenForCall(videoCallData, iframe, loading, connectionTimeout);

    iframe.onerror = () => {
      clearTimeout(connectionTimeout);
      loading.innerHTML = `
        <div style="color: #ff6b6b; text-align: center;">
          <h3>Connection Error</h3>
          <p>Failed to load video call. Please try again.</p>
          <button onclick="location.reload()" style="
            padding: 0.5rem 1rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
          ">Retry</button>
        </div>
      `;
    };
  }

  /**
   * Generate JWT token for Jitsi call
   */
  private generateJitsiTokenForCall(videoCallData: VideoCallResponse, iframe: HTMLIFrameElement, loading: HTMLElement, connectionTimeout: any): void {
    // Extract room name from URL or generate one
    let roomName = this.extractRoomNameFromUrl(videoCallData.join_url);
    if (!roomName) {
      roomName = `meeting-${videoCallData.meeting_id}-${Date.now()}`;
    }

    // Generate JWT token
    this.courseService.generateJitsiToken(roomName, videoCallData.meeting_id).subscribe({
      next: (tokenResponse: any) => {
        console.log('JWT token generated:', tokenResponse);
        
        // Use the authenticated room URL
        const authenticatedUrl = tokenResponse.room_url;
        iframe.src = authenticatedUrl;

        // Handle iframe load
        iframe.onload = () => {
          clearTimeout(connectionTimeout);
          loading.style.display = 'none';
          iframe.style.display = 'block';
          console.log('Authenticated Jitsi iframe loaded successfully');
        };

        iframe.onerror = () => {
          clearTimeout(connectionTimeout);
          console.error('Failed to load authenticated Jitsi iframe');
          // Fallback to non-authenticated URL
          const fallbackUrl = `https://jitsi.riverlearn.co.ke/${roomName}`;
          iframe.src = fallbackUrl;
        };
      },
      error: (error: any) => {
        console.error('Failed to generate JWT token:', error);
        clearTimeout(connectionTimeout);
        
        // Fallback to non-authenticated URL
        const fallbackUrl = videoCallData.join_url || `https://jitsi.riverlearn.co.ke/${roomName}`;
        iframe.src = fallbackUrl;
        
        // Handle iframe load for fallback
        iframe.onload = () => {
          loading.style.display = 'none';
          iframe.style.display = 'block';
          console.log('Fallback Jitsi iframe loaded successfully');
        };
      }
    });
  }

  /**
   * Extract room name from Jitsi URL
   */
  private extractRoomNameFromUrl(url: string): string | null {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part);
      return pathParts[pathParts.length - 1] || null;
    } catch (error) {
      console.error('Error parsing URL:', error);
      return null;
    }
  }

  /**
   * Close embedded video call
   */
  closeEmbeddedVideoCall(): void {
    const embeddedCall = document.getElementById('embedded-video-call');
    if (embeddedCall) {
      document.body.removeChild(embeddedCall);
    }

    if (this.currentCallFrame) {
      try {
        this.currentCallFrame.destroy();
      } catch (error) {
        console.log('Error destroying call frame:', error);
      }
      this.currentCallFrame = null;
    }

    // Clear pending video call data
    this.pendingVideoCallData = null;
  }

  /**
   * Minimize embedded video call
   */
  private minimizeEmbeddedVideoCall(): void {
    const embeddedCall = document.getElementById('embedded-video-call');
    if (embeddedCall) {
      const videoArea = document.getElementById('embedded-video-area');
      const controls = embeddedCall.querySelector('div:last-child') as HTMLElement;
      
      if (videoArea && controls) {
        if (videoArea.style.display === 'none') {
          // Restore
          videoArea.style.display = 'flex';
          controls.style.display = 'flex';
          embeddedCall.style.height = '400px';
        } else {
          // Minimize
          videoArea.style.display = 'none';
          controls.style.display = 'none';
          embeddedCall.style.height = 'auto';
        }
      }
    }
  }

  /**
   * Toggle embedded video call fullscreen
   */
  private toggleEmbeddedFullscreen(): void {
    const embeddedCall = document.getElementById('embedded-video-call');
    if (embeddedCall) {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        embeddedCall.requestFullscreen().then(() => {
          embeddedCall.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: white;
            border-radius: 0;
            box-shadow: none;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: none;
            resize: none;
            overflow: hidden;
          `;
        }).catch(err => {
          console.log('Error attempting to enable fullscreen:', err);
        });
      } else {
        // Exit fullscreen
        document.exitFullscreen().then(() => {
          embeddedCall.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 500px;
            height: 400px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: 1px solid #e5e7eb;
            resize: both;
            overflow: hidden;
            min-width: 300px;
            min-height: 200px;
            max-width: 90vw;
            max-height: 80vh;
          `;
        });
      }
    }
  }

  /**
   * Toggle embedded video call resize mode
   */
  private toggleEmbeddedResize(): void {
    const embeddedCall = document.getElementById('embedded-video-call');
    if (embeddedCall) {
      const currentResize = embeddedCall.style.resize;
      if (currentResize === 'both') {
        // Disable resize
        embeddedCall.style.resize = 'none';
        embeddedCall.style.cursor = 'default';
      } else {
        // Enable resize
        embeddedCall.style.resize = 'both';
        embeddedCall.style.cursor = 'nw-resize';
      }
    }
  }

  /**
   * Add drag functionality to the video call window
   */
  private addDragFunctionality(header: HTMLElement, container: HTMLElement): void {
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e: MouseEvent) {
      if (e.target && (e.target as HTMLElement).tagName === 'BUTTON') {
        return; // Don't drag if clicking on buttons
      }
      
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === header || header.contains(e.target as Node)) {
        isDragging = true;
        header.style.cursor = 'grabbing';
      }
    }

    function drag(e: MouseEvent) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        container.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    }

    function dragEnd() {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
      header.style.cursor = 'move';
    }
  }

  /**
   * Close video call modal
   */
  closeVideoCallModal(): void {
    if (this.currentCallFrame) {
      try {
        this.currentCallFrame.destroy();
      } catch (error) {
        console.log('Error destroying call frame:', error);
      }
      this.currentCallFrame = null;
    }

    if (this.videoCallModal) {
      document.body.removeChild(this.videoCallModal);
      this.videoCallModal = null;
    }

    // Remove permission guidance modal if it exists
    const guidanceModal = document.getElementById('permission-guidance-modal');
    if (guidanceModal) {
      document.body.removeChild(guidanceModal);
    }

    // Clear pending video call data
    this.pendingVideoCallData = null;

    // Remove any added styles
    const addedStyle = document.querySelector('style[data-video-call]');
    if (addedStyle) {
      document.head.removeChild(addedStyle);
    }
  }

  /**
   * Toggle fullscreen mode
   */
  private toggleFullscreen(): void {
    if (this.videoCallModal) {
      if (!document.fullscreenElement) {
        this.videoCallModal.requestFullscreen().catch(err => {
          console.log('Error attempting to enable fullscreen:', err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('Video call error:', error);
    return throwError(() => error);
  }
}
