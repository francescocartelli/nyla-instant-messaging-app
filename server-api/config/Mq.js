import redis from 'redis'

let _redisClient

import { getLogger } from '../utility/logger.js'
const logger = getLogger()

export const connect = async url => {
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

export const publish = (...args) => _redisClient.publish(...args)

export const close = (...args) => _redisClient.quit(...args)