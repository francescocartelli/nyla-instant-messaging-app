const WebSocket = require('ws')

const { getCurrentUser } = require('./services/User')
const { redisClient, getChannel } = require('./services/Redis')
const { ConnMap } = require('./utils/ConnectionsMap')
const logger = require('./utils/Logger').logger

require('dotenv').config()

const boot = async () => {
    try {
        await redisClient.connect()

        const wss = new WebSocket.Server({ port: process.env.SERVER_PORT })
        const connMap = new ConnMap()

        wss.on('connection', async function (ws, req) {
            try {
                const user = await getCurrentUser(req)
                const channel = getChannel(user)

                const [forAll, remove, isInit] = connMap.add(user.id, ws)

                const onMessage = (message) => forAll((wsConn) => wsConn.send(message))
                const onClose = () => { logger.info(`${user.id} disconnected`); remove(() => redisClient.unsubscribe(channel)) }

                if (isInit) await redisClient.subscribe(channel, onMessage)

                ws.on('close', onClose)

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


