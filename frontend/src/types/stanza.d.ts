declare module 'stanza' {
  export interface Agent {
    on(event: string, handler: (...args: any[]) => void): void;
    start(): Promise<void>;
    joinRoom(jid: string, nick: string): Promise<void>;
    sendMessage(msg: { to: string; type: string; body: string }): Promise<void>;
  }

  export function createClient(config: any): Agent;
}


