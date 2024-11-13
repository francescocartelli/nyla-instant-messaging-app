const WebSocket = require('ws')
const axios = require('axios')

const { connect, subscribe, unsubscribe } = require('./config/Mq')

const createUserStore = require('./services/User')

const createLogger = require('./utitlities/Logger')
const createConnectionManager = require('./utitlities/ConnectionManager')
const { jwtTCookieHeader } = require('./utitlities/CookieJWT')
const { getChannel } = require('./utitlities/Channels')

require('dotenv').config()

const logger = createLogger(process.env.LOGGING_LEVEL)
const getCurrentUser = createUserStore(jwt => axios.get(`http://${process.env.API_SERVER_URL}/api/users/current`, jwtTCookieHeader(jwt)))

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

        const wss = new WebSocket.Server({ port: process.env.SERVER_PORT })

        wss.on('connection', onWsConnection)

        logger.info(`Subscribed to Redis server ${process.env.MQ_SERVER_URL}`)
        logger.info(`WebSocket server running on port ${process.env.SERVER_PORT}`)
    } catch (err) {
        logger.error("Error in Redis connection!")
        logger.info("Check your Redis server: it's probably not open")
    }
}

boot()


