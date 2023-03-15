import {ConstantBackoff, Websocket, WebsocketBuilder} from 'websocket-ts';

export type Message = {
    id: string
    name: string
    text: string
}

export type ConnectionCallback = (connected: boolean) => void;
export type MessageCallback = (history: Message[]) => void;

export class ChatClient {
    private ws: Websocket;

    private history: any[] = [];

    private connectionCallbacks: ConnectionCallback[] = [];
    private messageCallbacks: MessageCallback[] = [];

    constructor() {
        this.ws = new WebsocketBuilder('ws://localhost:3030')
          .withBackoff(new ConstantBackoff(1000))
          .onOpen((i, ev) => { this.fireConnectionChange(true) })
          .onClose((i, ev) => { this.fireConnectionChange(false) })
          .onError((i, ev) => { console.log("error") })
          .onMessage((i, ev) => { this.fireMessage(JSON.parse(ev.data) as Message) })
          .onRetry((i, ev) => { console.log("retry") })
          .build();
    }

    addConnectionCallback(callback: ConnectionCallback) {
        this.connectionCallbacks.push(callback);
    }

    removeConnectionCallback(callback: ConnectionCallback) {
        const index = this.connectionCallbacks.indexOf(callback);
        if (index > -1) {
            this.connectionCallbacks.splice(index, 1);
        }
    }

    addMessageCallback(callback: MessageCallback) {
        this.messageCallbacks.push(callback);
    }

    removeMessageCallback(callback: MessageCallback) {
        const index = this.messageCallbacks.indexOf(callback);
        if (index > -1) {
            this.messageCallbacks.splice(index, 1);
        }
    }

    send(name: string, text: string) {
        this.ws.send(JSON.stringify({
            id: Math.random().toString(36).substring(7),
            name,
            text,
        }));
    }

    private fireConnectionChange(connected: boolean) {
        this.connectionCallbacks.forEach(callback => callback(connected));
    }

    private fireMessage(message: Message) {
        console.log("message: ", message);
        this.history.push(message);
        this.messageCallbacks.forEach(callback => callback(this.history));
    }
}
