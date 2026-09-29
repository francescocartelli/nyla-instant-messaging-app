import * as redis from 'redis'

let _redisClient: ReturnType<typeof redis.createClient>

export const connect = (url: string) => {
    const [host, port] = url.split(':')

    _redisClient = redis.createClient({
        socket: {
            host,
            port: parseInt(port)
        }
    })

    return _redisClient.connect()
}

export const subscribe = (...args: Parameters<typeof _redisClient.subscribe>) => _redisClient.subscribe(...args)

export const unsubscribe = (...args: Parameters<typeof _redisClient.unsubscribe>) => _redisClient.unsubscribe(...args)