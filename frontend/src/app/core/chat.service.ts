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

@Injectable({ providedIn: 'root' })
export class ChatService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  messages$ = new Subject<ChatMessage>();
  connected$ = new Subject<boolean>();

  connect(groupId: number): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/ws/study-groups/${groupId}/`;
    
    console.log('Chat: Connecting to', wsUrl);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Chat: Connected successfully');
      this.reconnectAttempts = 0;
      this.connected$.next(true);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: ChatMessage = JSON.parse(event.data);
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
  }

  sendMessage(body: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ body }));
    } else {
      console.warn('Chat: Not connected, cannot send message');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

