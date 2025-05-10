import { clientFactory as stompClientFactory } from './stomp/client_factory.js'
import { clientWrapper } from './websocket/client_wrapper.js'
import { authWrapper } from './websocket/auth_wrapper.js'
import { WebSocketServer } from 'ws'
import dotenv from 'dotenv'

dotenv.config({ path: ['.env', '.env.local'] })

stompClientFactory({
    url: process.env.RABBITMQ_HOST,
    credentials: { login: process.env.RABBITMQ_LOGIN, passcode: process.env.RABBITMQ_PASSWORD },
    onConnect: stompClient => {
        const wss = new WebSocketServer({ port: process.env.WEBSOCKET_PORT })

        wss.on('connection', (ws) => {
            authWrapper(10_000, null, clientWrapper())(stompClient, ws)
        })
    },
    onWebSocketError: console.log,
    onStompError: console.log

}).activate()