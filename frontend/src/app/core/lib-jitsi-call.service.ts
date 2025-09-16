import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LibJitsiCallData {
  roomName: string;
  meetingTitle: string;
  userInfo: {
    displayName: string;
    email?: string;
    avatar?: string;
  };
  meetingId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LibJitsiCallService {
  private callDataSubject = new BehaviorSubject<LibJitsiCallData | null>(null);
  private isCallActiveSubject = new BehaviorSubject<boolean>(false);

  public callData$: Observable<LibJitsiCallData | null> = this.callDataSubject.asObservable();
  public isCallActive$: Observable<boolean> = this.isCallActiveSubject.asObservable();

  /**
   * Start a Lib-Jitsi-Meet call
   */
  startCall(callData: LibJitsiCallData): void {
    console.log('LibJitsiCallService: Starting Lib-Jitsi-Meet call:', callData);
    this.callDataSubject.next(callData);
    this.isCallActiveSubject.next(true);
    console.log('LibJitsiCallService: Call state set to active');
  }

  /**
   * End the current call
   */
  endCall(): void {
    console.log('LibJitsiCallService: Ending Lib-Jitsi-Meet call');
    this.callDataSubject.next(null);
    this.isCallActiveSubject.next(false);
    console.log('LibJitsiCallService: Call state set to inactive');
  }

  /**
   * Get current call data
   */
  getCurrentCallData(): LibJitsiCallData | null {
    return this.callDataSubject.value;
  }

  /**
   * Check if a call is currently active
   */
  isCallActive(): boolean {
    return this.isCallActiveSubject.value;
  }
}
