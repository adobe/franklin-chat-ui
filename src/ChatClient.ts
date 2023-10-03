import {ConstantBackoff, Websocket, WebsocketBuilder,WebsocketEvents} from 'websocket-ts';
import { v4 as uuid } from 'uuid';
import {sampleRUM} from "./rum";

export type User = {
  name: string,
  icon?: string,
};

export type Message = {
  ts: string
  user: User
  text: string
  threadId?: string
  replyCount?: number
  files?: Attachment[]
}

export type Attachment = {
  id: string
  name: string
  url: string
  thumbUrl: string
}

export enum ConnectionStatus {
  CONNECTED,
  DISCONNECTED,
}

export type ConnectionCallback = (status: ConnectionStatus) => void;
export type MessageCallback = (history: Message[]) => void;
export type ErrorCallback = (error: Error) => void;

const SERVICE_ENDPOINT = process.env.REACT_APP_SERVICE_ENDPOINT || 'ws://localhost:8081';
console.log(`Using service endpoint: ${SERVICE_ENDPOINT}`);

export class ChatClient {
  private client: Websocket;

  private email: string | undefined;
  private teamId: string | undefined;
  private channelId: string | undefined;
  private channelName: string | undefined;

  private history: Message[] = [];

  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private error: Error | undefined;

  private statusCallbacks: ConnectionCallback[] = [];
  private messageCallbacks: MessageCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];

  constructor(private token: string) {
    const builder = new WebsocketBuilder(`${SERVICE_ENDPOINT}?token=${token}`)
      .withBackoff(new ConstantBackoff(1000))
      .onClose((i, ev) => {
        this.fireStatusChange(ConnectionStatus.DISCONNECTED)
      })
      .onError((i, ev) => {
        console.log(`Websocket error: ${ev}`);
        sampleRUM('chat:error', { source: 'client#socket', target: ev.target });
        this.fireError(new Error(`Websocket error: ${ev}`));
      })
      .onRetry((i, ev) => {
        console.log("retry")
      })

    builder.onOpen(async (i, ev) => {
      await this.join();
    });

    builder.onMessage(async (i, ev) => {
      const message = JSON.parse(ev.data);
      switch (message.type) {
        case 'message':
          console.log(`Client message: ${JSON.stringify(message.data)}`);
          this.fireMessage(message.data)
          break;
        default:
          console.log(`Client unknown message: ${JSON.stringify(message)}`);
      }
    });

    this.client = builder.build();
  }

  addStatusCallback(callback: ConnectionCallback) {
    callback(this.connectionStatus);
    this.statusCallbacks.push(callback);
  }

  removeStatusCallback(callback: ConnectionCallback) {
    const index = this.statusCallbacks.indexOf(callback);
    if (index > -1) {
      this.statusCallbacks.splice(index, 1);
    }
  }

  addMessageCallback(callback: MessageCallback) {
    if (this.history.length > 0) {
      callback(this.history);
    }
    this.messageCallbacks.push(callback);
  }

  removeMessageCallback(callback: MessageCallback) {
    const index = this.messageCallbacks.indexOf(callback);
    if (index > -1) {
      this.messageCallbacks.splice(index, 1);
    }
  }

  addErrorCallback(callback: ErrorCallback) {
    if (this.error) {
      callback(this.error);
    }
    this.errorCallbacks.push(callback);
  }

  removeErrorCallback(callback: ErrorCallback) {
    const index = this.errorCallbacks.indexOf(callback);
    if (index > -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  getTeamId() {
    return this.teamId;
  }

  getChannelId() {
    return this.channelId;
  }

  getChannelName() {
    return this.channelName;
  }

  async join() {
    const {email, channelId, teamId, channelName} = await this.sendCommand<any, any>('join', {});
    if (!email || !channelId || !teamId || !channelName) {
      console.error(`Client ready without email or channel. Disconnecting...`);
      this.client.close();
    }

    this.email = email;
    this.teamId = teamId;
    this.channelId = channelId;
    this.channelName = channelName;

    console.log(`Client ready: ${email}, ${channelId}`);
    this.fireStatusChange(ConnectionStatus.CONNECTED);

    await this.requestHistory();
  }

  async postMessage(text: string, ts?: string) {
    return this.sendCommand<any, any>('post', {
      threadId: ts,
      user: {
        name: this.email,
      },
      text
    });
  }

  async requestHistory() {
    const latest = this.history.length > 0 ? this.history[this.history.length - 1].ts : undefined;
    console.log(`requesting history, latest: ${latest}`);
    const messages: Message[] = await this.sendCommand<Message[], any>('history', { latest });
    messages.forEach((message: any) => {
      this.history.push(message);
    });
    console.log(`received ${messages.length} messages`);
    this.messageCallbacks.forEach(callback => callback(this.history));
    return messages.length > 0;
  }

  async getReplies(ts: string) {
    return this.sendCommand<Message[], any>('replies', { ts });
  }

  private sendCommand<T, P>(command: string, data: P, timeout: number = 5000): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const correlationId = uuid();
      console.log(`sending command ${command} with correlationId ${correlationId}`);
      let handle = null as any;
      const callback = (i: Websocket, ev: MessageEvent) => {
        console.log(`received message with correlationId ${correlationId}`);
        if (handle) {
          clearTimeout(handle);
        }
        const data: any = JSON.parse(ev.data);
        if (data.correlationId === correlationId) {

          console.log(`received response for command ${command}`);
          i.removeEventListener(WebsocketEvents.message, callback);

          if (data.error) {
            reject(new Error(data.error));
          } else {
            resolve(data.data);
          }
        }
      };

      handle = setTimeout(() => {
        console.warn(`timeout for command ${command}`);
        this.client.removeEventListener(WebsocketEvents.message, callback);
        reject(new Error('timeout'));
      }, timeout);

      this.client.addEventListener(WebsocketEvents.message, callback);

      this.client.send(JSON.stringify({
        type: command,
        correlationId,
        data
      }));

      sampleRUM('chat:client', { source: 'message', target: this.channelId });
    });
  }

  private fireError(error: Error) {
    this.error = error;
    this.errorCallbacks.forEach(callback => callback(error));
  }

  private fireStatusChange(status: ConnectionStatus) {
    this.connectionStatus = status;
    this.statusCallbacks.forEach(callback => callback(status));
  }

  private fireMessage(message: Message) {
    console.log("message: ", message);
    if (message.threadId) {
      const parent = this.history.find(m => m.ts === message.threadId);
      if (parent) {
        parent.replyCount = parent.replyCount ? parent.replyCount + 1 : 1;
      }
    } else {
      this.history.unshift(message);
    }
    this.messageCallbacks.forEach(callback => callback(this.history));
  }
}
