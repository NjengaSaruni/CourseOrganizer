import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id?: number;
  sender: number;
  sender_name: string;
  body: string;
  created_at: string;
}

export interface PresenceEvent {
  type: 'presence';
  action: 'join' | 'leave';
  user: { id: number; name: string };
}

export interface TypingEvent {
  type: 'typing';
  user: { id: number; name: string };
  is_typing: boolean;
}

export interface SnapshotEvent {
  type: 'snapshot';
  users: Array<{ id: number; name: string }>;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  messages$ = new Subject<ChatMessage>();
  connected$ = new Subject<boolean>();
  presence$ = new Subject<PresenceEvent | SnapshotEvent>();
  typing$ = new Subject<TypingEvent>();

  connect(groupId: number): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    // Prefer direct backend in local Docker to avoid dev-proxy WS quirks
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
    const base = isLocal ? 'ws://localhost:8000' : protocol + '//' + window.location.host;
    const qs = token ? ('?token=' + encodeURIComponent(token)) : '';
    const wsUrl = base + '/ws/study-groups/' + groupId + '/' + qs;
    
    console.log('Chat: Connecting to', wsUrl);
    console.log('Chat: Current location:', window.location.toString());
    console.log('Chat: Group ID:', groupId);
    console.log('Chat: WebSocket readyState:', this.ws?.readyState);
    console.log('Chat: Attempting WebSocket connection...');
    
    // Close existing connection if any
    if (this.ws) {
      console.log('Chat: Closing existing connection...');
      this.ws.close();
      this.ws = null;
    }
    
    try {
      this.ws = new WebSocket(wsUrl);
      console.log('Chat: WebSocket created successfully');
      
      // Add error event handler
      this.ws.addEventListener('error', (error) => {
        console.error('Chat: WebSocket error:', error);
        this.connected$.next(false);
      });
      
      // Add close event handler
      this.ws.addEventListener('close', (event) => {
        console.log('Chat: WebSocket closed:', event.code, event.reason);
        this.connected$.next(false);
      });

      this.ws.onopen = () => {
        console.log('Chat: Connected successfully');
        this.reconnectAttempts = 0;
        this.connected$.next(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // If it has type, it's a control event (presence/typing/snapshot)
          if (data && typeof data === 'object' && 'type' in data) {
            if (data.type === 'presence' || data.type === 'snapshot') {
              this.presence$.next(data);
              return;
            }
            if (data.type === 'typing') {
              this.typing$.next(data);
              return;
            }
          }
          // Otherwise it's a chat message (legacy/plain)
          const message: ChatMessage = data;
          this.messages$.next(message);
        } catch (e) {
          console.error('Chat: Failed to parse message', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Chat: WebSocket error', error);
        this.connected$.next(false);
      };

      this.ws.onclose = () => {
        console.log('Chat: Disconnected');
        this.connected$.next(false);
        
        // Attempt reconnect with exponential backoff
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(groupId);
          }, delay);
        }
      };
    } catch (error) {
      console.error('Chat: Failed to create WebSocket:', error);
      this.connected$.next(false);
    }
  }

  sendMessage(body: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ body }));
    } else {
      console.warn('Chat: Not connected, cannot send message');
    }
  }

  sendTyping(isTyping: boolean): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'typing', is_typing: isTyping }));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

