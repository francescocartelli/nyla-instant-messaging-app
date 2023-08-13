const WebSocket = require('ws')

const { getCurrentUser } = require('./services/User')
const { redisClient, getChannel } = require('./services/Redis')

require('dotenv').config()

const boot = async () => {
    try {
        await redisClient.connect()

        const wss = new WebSocket.Server({ port: process.env.SERVER_PORT })

        wss.on('connection', async function (ws, req) {
            try {
                const user = await getCurrentUser(req)
                const channel = getChannel(user)

                console.log(`${user.id} connected and subscribed to ${channel}`)

                await redisClient.subscribe(channel, (message) => {
                    console.log(`${channel} received message`)
                    ws.send(message)
                })

                ws.on('close', async () => {
                    console.log(`${user.id} disconnected`)
                })
            } catch (err) {
                ws.send(JSON.stringify(err))
                ws.close()
            }
        })

        console.log(`WebSocket server running on port ${process.env.SERVER_PORT}.`)
        console.log(`Subscribed to Redis server ${process.env.MQ_SERVER_URL}.`)
    } catch (err) {
        console.log("Check your Redis server: it's probably not open")
        console.log(err)
    }
}

boot()


