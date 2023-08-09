const redis = require('redis')

require('dotenv').config()

const [host, port] = process.env.MQ_SERVER_URL.split(':')

const redisClient = redis.createClient({
    host: host,
    port: port
})

exports.sendToUsers = async (users, message) => {
    if (!redisClient.isReady) await redisClient.connect()

    // map each user id to the redis publish on user channel promise
    const pubs = users.map(user => {
        const userChannel = `user:${user}`
        return redisClient.publish(userChannel, message)
    })

    return Promise.all(pubs)
}