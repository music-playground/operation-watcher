const parseCommand = (command) => {
    let parsed

    try {
        parsed = JSON.parse(command + '')
    } catch (e) {
        return false;
    }

    const { type, body } = parsed

    if (typeof type !== 'string' || typeof body !== 'object') {
        return false;
    }

    return { type, body }
}

const packResponse = (type, message, code) => {
    return JSON.stringify({ type, message, code })
}

const withCommand = (message, type, constrains, ws, next) => {
    const command = parseCommand(message)

    if (!command) {
        ws.send(packResponse('error', 'Invalid command format', 110))

        return
    }

    if (type && type !== command.type) return

    if (constrains?.some(([key, type]) => typeof command.body[key] !== type)) {
       ws.send(packResponse('error', 'Invalid bodies fields', 111))

        return
    }

    next(command)
}

export { withCommand, packResponse }