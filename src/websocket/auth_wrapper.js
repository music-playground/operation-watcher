import { packResponse, withCommand } from './message.js'

export const authWrapper = (authTime, secretKey, next) => {
    return (stomp, ws) => {
        const wsr = new WeakRef(ws)

        const timerId = setTimeout(() => wsr.deref()?.close(), authTime)

        ws.on('message', message => {
            withCommand(
                message,
                'auth',
                [['token', 'string']],
                ws,
                async ({ body: { token } }) => {
                    try {
                        clearTimeout(timerId)
                        //TODO: Implement auth on user service created
                        next?.(stomp, ws)
                        ws.send(packResponse('done', 'Auth is success', 220))
                    } catch (e) {
                        ws.send(packResponse('error', 'Invalid token', 210))
                    }
                }
            )
        })

        ws.on('close', () => {
            clearTimeout(timerId)
        })
    }
}