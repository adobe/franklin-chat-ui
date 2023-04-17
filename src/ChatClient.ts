import {ConstantBackoff, Websocket, WebsocketBuilder} from 'websocket-ts';

export type Message = {
    id: string
    name: string
    text: string
}

export type ConnectionCallback = (connected: boolean) => void;
export type MessageCallback = (history: Message[]) => void;

const SERVICE_ENDPOINT = process.env.REACT_APP_SERVICE_ENDPOINT || 'ws://localhost:8081';

export class ChatClient {
    private ws!: Websocket;

    private history: any[] = [];

    private connectionCallbacks: ConnectionCallback[] = [];
    private messageCallbacks: MessageCallback[] = [];

    isConnected(): boolean {
        return this.ws !== undefined && this.ws.underlyingWebsocket?.readyState === this.ws.underlyingWebsocket?.OPEN;
    }
    connect({ user, token }: { user: string, token: string }) {
        console.log(`Connecting chat client to service endpoint: ${SERVICE_ENDPOINT}`);
        if (!this.ws) {
            this.ws = new WebsocketBuilder(SERVICE_ENDPOINT)
                .withBackoff(new ConstantBackoff(2000))
                .onOpen((i, ev) => { 
                    this.admin({ cmd: 'join', user, token });
                    this.fireConnectionChange(true);
                })
                .onClose((i, ev) => { this.fireConnectionChange(false) })
                .onError((i, ev) => { console.log("error") })
                .onMessage((i, ev) => { this.fireMessage(JSON.parse(ev.data) as Message) })
                .onRetry((i, ev) => { console.log("retry") })
                .build();
        }
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

    admin(cmd: any) {
        console.log("admin: ", cmd)
        this.ws.send(JSON.stringify({
            id: Math.random().toString(36).substring(7),
            ...cmd
        }));
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
