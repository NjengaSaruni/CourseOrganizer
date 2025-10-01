import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import * as XMPP from 'stanza';
import 'stanza/plugins/muc';

@Injectable({ providedIn: 'root' })
export class XmppService {
  private wsPath = environment.chat?.websocketPath || '/xmpp-websocket';
  private boshPath = environment.chat?.boshPath || '/http-bind';
  // Use main server for handshake; Prosody handles guest domain internally
  private domain = 'jitsi.riverlearn.co.ke';
  private mucDomain = 'conference.jitsi.riverlearn.co.ke';

  private client: XMPP.Agent | null = null;
  private isStarted = false;
  private usingBosh = false;
  messages$ = new Subject<{ room: string; from: string; body: string }>();

  getWebsocketUrl(): string {
    if (this.wsPath.startsWith('wss://') || this.wsPath.startsWith('ws://')) {
      return this.wsPath;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${window.location.host}${this.wsPath}`;
  }

  getBoshUrl(): string {
    if (this.boshPath.startsWith('http://') || this.boshPath.startsWith('https://')) {
      return this.boshPath;
    }
    return `${window.location.protocol}//${window.location.host}${this.boshPath}`;
  }

  async connectAnonymous(): Promise<void> {
    if (this.isStarted) return;
    console.log('XMPP: Attempting to connect to', this.getWebsocketUrl());
    console.log('XMPP: Using domain', this.domain);
    console.log('XMPP: Using MUC domain', this.mucDomain);
    
    // Test WebSocket endpoint first
    try {
      const wsUrl = this.getWebsocketUrl();
      console.log('XMPP: Testing WebSocket endpoint...');
      const testWs = new WebSocket(wsUrl);
      testWs.onopen = () => {
        console.log('XMPP: WebSocket endpoint is reachable');
        testWs.close();
      };
      testWs.onerror = (e) => {
        console.error('XMPP: WebSocket endpoint test failed', e);
      };
    } catch (e) {
      console.error('XMPP: WebSocket test error', e);
    }
    
    this.client = XMPP.createClient({
      transports: {
        websocket: this.getWebsocketUrl(),
        bosh: false
      },
      transportPreferenceOrder: ['websocket', 'bosh'],
      server: this.domain,
      resource: 'web'
    });

    this.client.on('session:started', () => {
      console.log('XMPP: Connected successfully');
    });
    this.client.on('message', (msg: any) => {
      if (msg.type === 'groupchat' && msg.body) {
        const from = (msg.from || '') as string;
        const roomBare = from.split('/')[0] || '';
        this.messages$.next({ room: roomBare, from, body: msg.body });
      }
    });
    this.client.on('disconnected', () => console.log('XMPP: Disconnected'));
    this.client.on('stream:error', (e: any) => console.warn('XMPP: Stream error', e));
    this.client.on('connected', () => console.log('XMPP: Transport connected'));
    this.client.on('error', (e: any) => console.error('XMPP: General error', e));

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('XMPP: Connection timeout after 10 seconds');
        // Fallback to BOSH once if WS failed
        if (!this.usingBosh) {
          console.warn('XMPP: Falling back to BOSH');
          try {
            this.reconnectWithBosh(resolve, reject);
            return;
          } catch (e) {
            return reject(new Error('Connection timeout'));
          }
        }
        return reject(new Error('Connection timeout'));
      }, 10000);

      this.client!.on('session:started', () => {
        console.log('XMPP: Start successful');
        clearTimeout(timeout);
        this.isStarted = true;
        resolve();
      });
      this.client!.on('stream:error', (e: any) => {
        console.error('XMPP: Start failed', e);
        clearTimeout(timeout);
        reject(e);
      });
      this.client!.on('error', (e: any) => {
        console.error('XMPP: Connection error', e);
        clearTimeout(timeout);
        reject(e);
      });
      
      console.log('XMPP: Calling connect() over WebSocket...');
      (this.client as any).connect();
    });
  }

  private reconnectWithBosh(resolve: () => void, reject: (e: any) => void) {
    const boshUrl = this.getBoshUrl();
    this.usingBosh = true;
    this.client = XMPP.createClient({
      transports: {
        websocket: false,
        bosh: boshUrl
      },
      transportPreferenceOrder: ['bosh'],
      server: this.domain,
      resource: 'web'
    });

    this.client.on('session:started', () => {
      console.log('XMPP: Connected successfully via BOSH');
      this.isStarted = true;
      resolve();
    });
    this.client.on('message', (msg: any) => {
      if (msg.type === 'groupchat' && msg.body) {
        const from = (msg.from || '') as string;
        const roomBare = from.split('/')[0] || '';
        this.messages$.next({ room: roomBare, from, body: msg.body });
      }
    });
    this.client.on('stream:error', (e: any) => {
      console.error('XMPP: BOSH stream error', e);
      reject(e);
    });
    console.log('XMPP: Calling connect() over BOSH...', boshUrl);
    (this.client as any).connect();
  }

  async joinRoom(roomName: string, nick: string): Promise<void> {
    if (!this.client) await this.connectAnonymous();
    const roomJid = `${roomName}@${this.mucDomain}`;
    console.log('XMPP: Joining room', roomJid, 'as', nick);
    try {
      await this.client!.joinRoom(roomJid, nick);
      console.log('XMPP: Successfully joined room');
    } catch (e: any) {
      console.error('XMPP: Failed to join room', e);
      throw e;
    }
  }

  async sendGroupMessage(roomName: string, body: string): Promise<void> {
    if (!this.client) return;
    const roomJid = `${roomName}@${this.mucDomain}`;
    console.log('XMPP: Sending message to', roomJid, ':', body);
    try {
      this.client!.sendMessage({ to: roomJid, type: 'groupchat', body });
      console.log('XMPP: Message sent successfully');
    } catch (e: any) {
      console.error('XMPP: Failed to send message', e);
      throw e;
    }
  }
}


