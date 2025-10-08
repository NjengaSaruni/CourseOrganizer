import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id?: number;
  sender: number;
  sender_name: string;
  body: string;
  created_at: string;
  client_id?: string;
  status?: 'pending' | 'sent' | 'failed';
  reply_to?: {
    id: number;
    sender_name: string;
    body: string;
    created_at: string;
  };
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
  private currentGroupId: number | null = null;
  
  messages$ = new Subject<ChatMessage>();
  connected$ = new Subject<boolean>();
  presence$ = new Subject<PresenceEvent | SnapshotEvent>();
  typing$ = new Subject<TypingEvent>();
  private myUserId: number | null = null;

  connect(groupId: number): void {
    // If already connected to this group, don't reconnect
    if (this.ws?.readyState === WebSocket.OPEN && this.currentGroupId === groupId) {
      console.log(`Chat: Already connected to group ${groupId}`);
      return;
    }
    
    // If connected to a different group, disconnect first
    if (this.ws?.readyState === WebSocket.OPEN && this.currentGroupId !== groupId) {
      console.log(`Chat: Disconnecting from group ${this.currentGroupId} to connect to ${groupId}`);
      this.disconnect();
    }
    
    this.currentGroupId = groupId;

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
        
        // Fallback: Set user ID from localStorage if not already set
        if (!this.myUserId) {
          const fallbackUserId = this.getCurrentUserIdFromStorage();
          if (fallbackUserId) {
            this.myUserId = fallbackUserId;
            console.log('🔧 Set fallback myUserId from localStorage:', fallbackUserId);
          }
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'whoami' && data.user) {
            this.myUserId = Number(data.user.id) || null;
            console.log('Whoami event received - Setting myUserId:', {
              receivedUserId: data.user.id,
              parsedUserId: this.myUserId,
              userName: data.user.name,
              localStorageUserId: localStorage.getItem('userId'),
              currentUserId: (() => {
                try {
                  const currentUser = localStorage.getItem('currentUser');
                  if (currentUser) {
                    const user = JSON.parse(currentUser);
                    return user.id;
                  }
                } catch (e) {}
                return null;
              })()
            });
            return;
          }
          // If it has type, it's a control event (presence/typing/snapshot)
          if (data && typeof data === 'object' && 'type' in data) {
            if (data.type === 'presence' || data.type === 'snapshot') {
              this.presence$.next(data);
              return;
            }
            if (data.type === 'typing') {
              // Do not show typing banner for myself
              // Use the improved user ID detection method
              let myId = this.myUserId || this.getCurrentUserIdFromStorage();
              
              const senderId = Number(data.user?.id) ?? -1;
              myId = myId ?? -1;
              
              console.log('Typing event received:', {
                myUserId: this.myUserId,
                localStorageUserId: localStorage.getItem('userId'),
                currentUserId: (() => {
                  try {
                    const currentUser = localStorage.getItem('currentUser');
                    if (currentUser) {
                      const user = JSON.parse(currentUser);
                      return user.id;
                    }
                  } catch (e) {}
                  return null;
                })(),
                tokenUserId: (() => {
                  try {
                    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
                    if (token) {
                      const payload = JSON.parse(atob(token.split('.')[1]));
                      return payload.user_id || payload.sub || null;
                    }
                  } catch (e) {}
                  return null;
                })(),
                finalMyId: myId,
                senderId,
                userName: data.user?.name,
                isTyping: data.is_typing,
                shouldShow: senderId !== myId,
                comparison: `${senderId} !== ${myId} = ${senderId !== myId}`
              });
              
              if (senderId !== myId) {
                console.log('✅ Showing typing indicator for:', data.user?.name);
                this.typing$.next(data);
              } else {
                console.log('❌ Filtering out typing indicator for self:', data.user?.name);
              }
              return;
            }
          }
          // Otherwise it's a chat message (legacy/plain)
          const message: ChatMessage = data;
          
          // Check if this message is from the current user and convert to "You"
          const currentUserId = this.myUserId ?? this.getCurrentUserIdFromStorage();
          if (currentUserId && Number(message.sender) === currentUserId) {
            message.sender_name = 'You';
          }
          
          console.log('📤 Emitting message from chat service:', {
            id: message.id,
            sender: message.sender,
            sender_name: message.sender_name,
            body: message.body,
            reply_to: message.reply_to,
            client_id: message.client_id
          });
          
          this.messages$.next(message);
        } catch (e) {
          console.error('Chat: Failed to parse message', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Chat: WebSocket error', error);
        this.connected$.next(false);
      };

      this.ws.onclose = (event) => {
        console.log('Chat: Disconnected', event.code, event.reason);
        this.connected$.next(false);
        
        // Only attempt reconnect if still connected to the same group and not a manual disconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts && 
            this.currentGroupId === groupId && 
            event.code !== 1000) { // 1000 is normal closure
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          console.log(`Chat: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
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

  sendMessage(body: string, replyTo?: { id: number; sender_name: string; body: string; created_at: string }): void {
    const trimmed = body.trim();
    if (!trimmed) return;
    const clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    // Optimistic local emit
    const optimistic: ChatMessage = {
      id: undefined,
      sender: 0,
      sender_name: 'You',
      body: trimmed,
      created_at: new Date().toISOString(),
      client_id: clientId,
      status: 'pending',
      reply_to: replyTo
    };
    
    console.log('📤 Creating optimistic message:', {
      body: trimmed,
      client_id: clientId,
      reply_to: replyTo,
      optimistic: optimistic
    });
    
    this.messages$.next(optimistic);

    if (this.ws?.readyState === WebSocket.OPEN) {
      const messageData = { 
        body: trimmed, 
        client_id: clientId,
        reply_to: replyTo 
      };
      console.log('📡 Sending WebSocket message:', messageData);
      this.ws.send(JSON.stringify(messageData));
    } else {
      console.warn('Chat: Not connected, cannot send message');
      const failed: ChatMessage = { ...optimistic, status: 'failed' };
      this.messages$.next(failed);
    }
  }

  sendTyping(isTyping: boolean): void {
    console.log('📤 Sending typing event:', { isTyping, wsReady: this.ws?.readyState === WebSocket.OPEN });
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'typing', is_typing: isTyping }));
      console.log('✅ Typing event sent successfully');
    } else {
      console.log('❌ WebSocket not ready, cannot send typing event');
    }
  }

  disconnect(): void {
    if (this.ws) {
      console.log('Chat: Manually disconnecting from group', this.currentGroupId);
      this.ws.close(1000, 'Manual disconnect'); // 1000 = normal closure
      this.ws = null;
    }
    this.currentGroupId = null;
    this.reconnectAttempts = 0;
    this.connected$.next(false);
  }

  private getCurrentUserIdFromStorage(): number | null {
    // Try localStorage first
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const userId = Number(storedUserId);
      if (!isNaN(userId)) {
        console.log('✅ Got user ID from localStorage.userId:', userId);
        return userId;
      }
    }
    
    // Try currentUser from localStorage (primary source)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        if (user.id) {
          console.log('✅ Got user ID from localStorage.currentUser:', user.id);
          return user.id;
        }
      } catch (e) {
        console.warn('Could not parse currentUser from localStorage');
      }
    }
    
    // Try to get from auth token as last resort
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT token to get user ID (basic decode, no verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.user_id || payload.sub;
        if (userId) {
          console.log('✅ Got user ID from token:', userId);
          return userId;
        }
      } catch (e) {
        console.warn('Could not decode token for user ID');
      }
    }
    
    console.warn('❌ Could not get user ID from any source');
    return null;
  }
}

