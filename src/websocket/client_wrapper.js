import { packResponse, withCommand } from './message.js'

let subscriptions = {}
let unsubscribeMethods = {}
let clientSubscriptions = new WeakMap()

const stompDestination = operationId => '/exchange/operations/' + operationId

const clientWrapper = next => {
    return (stomp, ws) => {
        ws.on('message', (message) => {
            withCommand(
                message,
                'subscribe',
                [['operationId', 'string']],
                ws,
                async ({ body: { operationId } }) => {
                    subscriptions ??= {};
                    subscriptions[operationId] ??= [];
                    subscriptions[operationId].push(ws)

                    clientSubscriptions.set(ws, [...(clientSubscriptions.get(ws) || []), operationId])

                    if (subscriptions[operationId].length === 1) {
                        unsubscribeMethods[operationId] = stomp.subscribe(stompDestination(operationId), message => {
                            subscriptions[operationId].forEach(ws => {
                                ws.send(packResponse('operation.message', { body: JSON.parse(message.body) }, 120))
                            })
                        })
                    }
                })
        })

        ws.on('close', async () => {
            const subs = clientSubscriptions.get(ws) || [];

            for (const operationId of subs) {
                subscriptions[operationId] = subscriptions[operationId].filter(val => val !== ws)

                if (subscriptions[operationId].length === 0) {
                    unsubscribeMethods[operationId]?.unsubscribe()

                    delete subscriptions[operationId]
                }
            }
        })

        next?.(stomp, ws)
    }
}


export { clientWrapper, subscriptions }