const redis = require('redis')

let _redisClient

exports.connect = async url => {
    try {
        const [host, port] = url.split(':')

        _redisClient = redis.createClient({
            socket: {
                host: host,
                port: port
            }
        })
    
        await _redisClient.connect()

        console.log("Connected to Redis!")
    } catch (err) {
        console.log("Error in Redis connection!")
        console.log("Check your Redis server: it's probably not open")
    }
}

exports.publish = (...args) => _redisClient.publish(...args)