import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

let connection: HubConnection | null = null;

export const createSignalRConnection = (url: string): HubConnection => {
    if (connection && connection.state !== HubConnectionState.Disconnected) {
        console.log('Reusing existing SignalR connection');
        return connection;
    }

    console.log('Creating new SignalR connection');
    connection = new HubConnectionBuilder()
        .withUrl(url)  
        .withAutomaticReconnect()
        .build();

    connection.start()
        .then(() => {
            console.log('SignalR connection established');
        })
        .catch(err => {
            console.error('Error while establishing SignalR connection: ', err);
        });

    return connection;
};