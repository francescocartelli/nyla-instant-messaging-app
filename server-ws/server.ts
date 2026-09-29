import { WebSocketServer } from 'ws'
import dotenv from 'dotenv'

dotenv.config()

import { connect, subscribe, unsubscribe } from './config/Mq.js'

import createGetCurrentUser from './services/User.js'

import createLogger from './utilities/Logger.js'
import createConnectionManager from './utilities/ConnectionManager.js'
import { jwtTCookieHeader } from './utilities/CookieJWT.js'
import { getChannel } from './utilities/Channels.js'

const logger = createLogger(process.env.LOGGING_LEVEL)

const getCurrentUser = createGetCurrentUser(async jwt => fetch(`${process.env.API_SERVER_URL}/api/users/current`, {
    method: 'GET',
    headers: jwtTCookieHeader(jwt)
}).then(res => res.json()))

const { addConnection } = createConnectionManager({ log: logger.debug })

const onWsConnection = async (ws, req) => {
    try {
        const user = await getCurrentUser(req)
        const channel = getChannel(user)

        const { to, remove, isInit } = addConnection(user.id, ws)

        if (isInit) await subscribe(channel, message => to(wsConn => wsConn.send(message)))

        ws.on('close', () => {
            logger.info(`${user.id} disconnected`)
            remove(
                wsConn => wsConn.close(),
                () => unsubscribe(channel))
        })

        logger.info(`${user.id} connected`)
    } catch (err) {
        logger.error(err)
        ws.close()
    }
}

const boot = async () => {
    try {
        await connect(process.env.MQ_SERVER_URL)

        const wss = new WebSocketServer({ port: process.env.SERVER_PORT })

        wss.on('connection', onWsConnection)

        logger.info(`Subscribed to Redis server ${process.env.MQ_SERVER_URL}`)
        logger.info(`WebSocket server running on port ${process.env.SERVER_PORT}`)
    } catch (err) {
        logger.error("Error in Redis connection!")
        logger.info("Check your Redis server: it's probably not open")
    }
}

boot()