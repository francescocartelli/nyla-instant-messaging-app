const redis = require('redis')

let _redisClient

const { getLogger } = require('../utility/logger')
const logger = getLogger()

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

        logger.info("Connected to Redis!")
    } catch (err) {
        logger.debug(err)
        logger.error("Error in Redis connection!")
    }
}

exports.publish = (...args) => _redisClient.publish(...args)

exports.close = (...args) => _redisClient.quit(...args)