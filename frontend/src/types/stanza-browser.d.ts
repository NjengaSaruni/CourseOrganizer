declare module 'stanza/browser' {
  export interface Agent {
    on(event: string, handler: (...args: any[]) => void): void;
    connect(): void;
    joinRoom(jid: string, nick: string): Promise<any>;
    sendMessage(msg: { to: string; type: string; body: string }): string;
  }

  export function createClient(config: any): Agent;
}


