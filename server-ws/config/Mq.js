const redis = require('redis')

let _redisClient

exports.connect = url => {
    const [host, port] = url.split(':')

    _redisClient = redis.createClient({
        socket: {
            host: host,
            port: port
        }
    })

    return _redisClient.connect()
}

exports.subscribe = (...args) => _redisClient.subscribe(...args)
exports.unsubscribe = (...args) => _redisClient.unsubscribe(...args)