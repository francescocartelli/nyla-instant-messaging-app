import * as redis from 'redis'

let _redisClient: ReturnType<typeof redis.createClient>

import { getLogger } from '../utility/logger.ts'
const logger = getLogger()

export const connect = async (url: string) => {
    try {
        const [host, port] = url.split(':')

        _redisClient = redis.createClient({
            socket: {
                host,
                port: parseInt(port)
            }
        })

        await _redisClient.connect()

        logger?.info("Connected to Redis!")
    } catch (err) {
        logger?.debug(err)
        logger?.error("Error in Redis connection!")
    }
}

export const publish = (...args: Parameters<typeof _redisClient.publish>) => _redisClient.publish(...args)

export const close = (...args: Parameters<typeof _redisClient.quit>) => _redisClient.quit(...args)