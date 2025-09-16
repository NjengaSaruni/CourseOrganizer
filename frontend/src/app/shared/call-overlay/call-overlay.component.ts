import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibJitsiCallService, LibJitsiCallData } from '../../core/lib-jitsi-call.service';
import { LibJitsiVideoCallComponent } from '../../features/video-call/lib-jitsi-video-call.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-call-overlay',
  standalone: true,
  imports: [CommonModule, LibJitsiVideoCallComponent],
  template: `
    <!-- Call Overlay -->
    <div *ngIf="isCallActive" 
         class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl shadow-2xl w-full h-full max-w-7xl max-h-full overflow-hidden">
        <!-- Close Buttons -->
        <div class="absolute top-4 right-4 z-10 flex space-x-2">
          <!-- Force Close Button (for debugging) -->
          <button (click)="forceClose()" 
                  class="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full transition-colors"
                  title="Force Close (Debug)">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </button>
          <!-- Normal Close Button -->
          <button (click)="endCall()" 
                  class="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Lib-Jitsi-Meet Component -->
        <app-lib-jitsi-video-call
          #jitsiComponent
          *ngIf="callData"
          [roomName]="callData.roomName"
          [meetingTitle]="callData.meetingTitle"
          [userInfo]="callData.userInfo"
          (meetingEnded)="onMeetingEnded()"
          (closeRequested)="onCloseRequested()">
        </app-lib-jitsi-video-call>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CallOverlayComponent implements OnInit, OnDestroy {
  @ViewChild(LibJitsiVideoCallComponent) jitsiComponent!: LibJitsiVideoCallComponent;
  
  isCallActive = false;
  callData: LibJitsiCallData | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(private libJitsiCallService: LibJitsiCallService) {}

  ngOnInit() {
    console.log('CallOverlayComponent: Initializing');
    
    // Subscribe to call state changes
    this.subscriptions.push(
      this.libJitsiCallService.isCallActive$.subscribe(active => {
        console.log('CallOverlayComponent: isCallActive changed to:', active);
        this.isCallActive = active;
      })
    );

    this.subscriptions.push(
      this.libJitsiCallService.callData$.subscribe(data => {
        console.log('CallOverlayComponent: callData changed to:', data);
        this.callData = data;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  endCall() {
    this.libJitsiCallService.endCall();
  }

  onMeetingEnded() {
    console.log('Meeting ended, closing overlay');
    this.libJitsiCallService.endCall();
  }

  onCloseRequested() {
    console.log('Close requested, closing overlay');
    this.libJitsiCallService.endCall();
  }

  forceClose() {
    console.log('Force close requested, immediately closing overlay');
    
    // Try to force close the Jitsi component first
    if (this.jitsiComponent) {
      console.log('CallOverlayComponent: Calling forceClose on Jitsi component');
      this.jitsiComponent.forceClose();
    }
    
    // Then close the overlay
    this.libJitsiCallService.endCall();
  }
}
