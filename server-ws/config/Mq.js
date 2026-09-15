import redis from 'redis'

let _redisClient

export const connect = url => {
    const [host, port] = url.split(':')

    _redisClient = redis.createClient({
        socket: {
            host: host,
            port: port
        }
    })

    return _redisClient.connect()
}

export const subscribe = (...args) => _redisClient.subscribe(...args)
export const unsubscribe = (...args) => _redisClient.unsubscribe(...args)