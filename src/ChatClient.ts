import {io, Socket} from 'socket.io-client';
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
    private client: Socket;

    private email: string|undefined;
    private teamId: string|undefined;
    private channelId: string|undefined;
    private channelName: string|undefined;

    private history: Message[] = [];

    private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
    private error: Error|undefined;

    private statusCallbacks: ConnectionCallback[] = [];
    private messageCallbacks: MessageCallback[] = [];
    private errorCallbacks: ErrorCallback[] = [];

    constructor(private token: string) {
        this.client = io(SERVICE_ENDPOINT, {
            reconnection: true,
            query: {
                "token": token
            }
        });

        this.client.on("reconnect", (attempt) => console.log(`reconnect: ${attempt}`));
        this.client.on("disconnect", () => { this.fireStatusChange(ConnectionStatus.DISCONNECTED) });
        this.client.on("error", (error) => {
            console.log(`Error: ${error}`);
            sampleRUM('chat:client', { source: 'error', target: error });
            this.fireError(new Error(error));
        });

        this.client.on('ready', async ({email, channelId, teamId, channelName}) => {
            if (!email || !channelId || !teamId || !channelName) {
                console.error(`Client ready without email or channel: ${email}, ${channelId}, ${teamId}, ${channelName}. Disconnecting...`);
                this.client.disconnect();
            }
            this.email = email;
            this.teamId = teamId;
            this.channelId = channelId;
            this.channelName = channelName;
            console.log(`Client ready: ${email}, ${channelId}`);
            sampleRUM('chat:client', { source: 'ready', target: channelId });
            this.fireStatusChange(ConnectionStatus.CONNECTED);
            await this.requestHistory();
        });
        this.client.on('message', (data) => { this.fireMessage(data as Message) });
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

    send(text: string, ts?: string) {
        this.client.emit('message', {
            threadId: ts,
            user: {
                name: this.email,
            },
            text
        } as Message);
        sampleRUM('chat:client', { source: 'message', target: this.channelId });
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

    fireError(error: Error) {
        this.error = error;
        this.errorCallbacks.forEach(callback => callback(error));
    }
}
