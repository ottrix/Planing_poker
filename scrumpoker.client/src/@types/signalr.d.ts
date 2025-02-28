declare module '@microsoft/signalr' {
    export class HubConnection {
        start(): Promise<void>;
        stop(): Promise<void>;
        invoke(methodName: string, ...args: any[]): Promise<any>;
        on(methodName: string, newMethod: (...args: any[]) => void): void;
        off(methodName: string, method: (...args: any[]) => void): void;
        state: HubConnectionState;
    }

    export class HubConnectionBuilder {
        withUrl(url: string): HubConnectionBuilder;
        withAutomaticReconnect(): HubConnectionBuilder;
        build(): HubConnection;
    }

    export enum HubConnectionState {
        Disconnected,
        Connecting,
        Connected,
        Reconnecting,
        Disconnecting
    }
}
