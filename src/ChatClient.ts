import {io, Socket} from 'socket.io-client';

type User = {
    name: string,
    icon?: string,
};

export type Message = {
    ts: string
    user: User
    text: string
    threadId?: string
    replyCount?: number
}

export type ConnectionCallback = (connected: boolean) => void;
export type MessageCallback = (history: Message[]) => void;

const SERVICE_ENDPOINT = process.env.REACT_APP_SERVICE_ENDPOINT || 'ws://localhost:8081';
console.log(`Using service endpoint: ${SERVICE_ENDPOINT}`);

export class ChatClient {
    private client: Socket;

    private email: string|undefined;
    private channelId: string|undefined;
    private channelName: string|undefined;

    private history: Message[] = [];

    private connectionCallbacks: ConnectionCallback[] = [];
    private messageCallbacks: MessageCallback[] = [];

    constructor(private token: string) {
        this.client = io(SERVICE_ENDPOINT, {
            reconnection: true,
            query: {
                "token": token
            }
        });

        this.client.on("disconnect", () => { this.fireConnectionChange(false) });
        this.client.on("reconnect", (attempt) => console.log(`reconnect: ${attempt}`));
        this.client.on("error", (error) => console.log(`error: ${error}`));

        this.client.on('ready', async ({email, channelId, channelName}) => {
            if (!email || !channelId || !channelName) {
                console.error(`Client ready without email or channel: ${email}, ${channelId}, ${channelName}. Disconnecting...`);
                this.client.disconnect();
            }
            this.email = email;
            this.channelId = channelId;
            this.channelName = channelName;
            console.log(`Client ready: ${email}, ${channelId}`);
            this.fireConnectionChange(true)
            this.requestHistory();
        });
        this.client.on('message', (data) => { this.fireMessage(data as Message) });
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

    send(text: string, ts?: string) {
        this.client.emit('message', {
            threadId: ts,
            user: {
                name: this.email,
            },
            text,
        } as Message);
    }

    getChannelName() {
        return this.channelName;
    }

    async getReplies(ts: string) {
        console.log(`requesting replies for ${ts}`)
        const replies: Message[] = await this.client.emitWithAck('replies', { ts });
        console.log(`received ${replies.length} replies`);
        return replies;
    }

    async requestHistory() {
        const latest = this.history.length > 0 ? this.history[this.history.length - 1].ts : undefined;
        console.log(`requesting history, latest: ${latest}`);
        const messages: Message[] = await this.client.emitWithAck('history', { latest });
        console.log(`received ${messages.length} messages`);
        messages.forEach(message => {
            this.history.push(message);
        });
        this.messageCallbacks.forEach(callback => callback(this.history));
        return messages.length > 0;
    }

    private fireConnectionChange(connected: boolean) {
        this.connectionCallbacks.forEach(callback => callback(connected));
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
