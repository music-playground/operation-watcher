import { Client } from '@stomp/stompjs'

export const clientFactory = ({ url, credentials, onConnect, onStompError, onWebSocketError }) => {
    const client = new Client({
        brokerURL: url,
        connectHeaders: {
            login: credentials.login,
            passcode: credentials.passcode
        },
        onConnect: () => { onConnect?.(client) },
        onStompError,
        onWebSocketError,
        reconnectDelay: 5000,
        maxReconnectDelay: 60000
    });

    return client
}