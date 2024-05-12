const WebSocket = require('ws')

const { getCurrentUser } = require('./services/User')
const { redisClient, getChannel } = require('./services/Redis')
const { createConnectionManager } = require('./utils/ConnectionManager')
const { logger } = require('./utils/Logger')

require('dotenv').config()

const boot = async () => {
    try {
        await redisClient.connect()

        const wss = new WebSocket.Server({ port: process.env.SERVER_PORT })
        const { addConnection } = new createConnectionManager()

        wss.on('connection', async (ws, req) => {
            try {
                const user = await getCurrentUser(req)
                const channel = getChannel(user)

                const { to, remove, isInit } = addConnection(user.id, ws)

                if (isInit) await redisClient.subscribe(channel, (message) => {
                    to((wsConn) => wsConn.send(message))
                })

                ws.on('close', () => {
                    logger.info(`${user.id} disconnected`)
                    remove(() => redisClient.unsubscribe(channel))
                })

                logger.info(`${user.id} connected`)
            } catch (err) {
                logger.error(err)
                ws.close()
            }
        })

        logger.info(`WebSocket server running on port ${process.env.SERVER_PORT}.`)
        logger.info(`Subscribed to Redis server ${process.env.MQ_SERVER_URL}.`)
    } catch (err) {
        logger.warn("Check your Redis server: it's probably not open")
        logger.error(err)
    }
}

boot()


