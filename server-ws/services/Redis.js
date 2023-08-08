const redis = require('redis')

require('dotenv').config()

const [host, port] = process.env.MQ_SERVER_URL.split(':')

exports.redisClient = redis.createClient({
    host: host,
    port: port
})

exports.getChannel = ({id}) => {
    return `user:${id}`
}