const WebSocket = require('ws')

const { getCurrentUser } = require('./services/User')
const { redisClient, getChannel } = require('./services/Redis')

require('dotenv').config()

const boot = async () => {
    try {
        await redisClient.connect()

        const wss = new WebSocket.Server({ port: process.env.SERVER_PORT })

        wss.on('connection', async function (ws, req) {
            const user = await getCurrentUser(req)
            const channel = getChannel(user)

            console.log(`${user.id} connected`)

            await redisClient.subscribe(channel, (message) => {
                console.log(`${channel} received message`)
                ws.send(message)
            })

            ws.on('close', () => {
                redisClient.unsubscribe(channel)
                console.log(`${user.id} disconnected`)
            })
        })

        console.log(`WebSocket server running on port ${process.env.SERVER_PORT}.`)
    } catch (err) {
        console.log(err)
    }
}

boot()


