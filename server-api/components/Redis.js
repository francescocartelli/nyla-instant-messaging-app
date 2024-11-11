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

const messageTypes = {
    MESSAGE_CREATE: 'MESSAGE_CREATE',
    MESSAGE_DELETE: 'MESSAGE_DELETE',
    CHAT_DELETE: 'CHAT_DELETE'
}

exports.mqCreateMessage = ({ id, sender, chat, content, chatName, senderUsername }) => ({
    type: messageTypes.MESSAGE_CREATE,
    chat: chat,
    message: {
        id: id,
        idSender: sender,
        idChat: chat,
        chatName: chatName,
        senderUsername: senderUsername,
        content: content
    }
})

exports.mqDeleteMessage = ({ id, sender, chat, content, chatName, senderUsername }) => ({
    type: messageTypes.MESSAGE_DELETE,
    chat: chat,
    message: {
        id: id,
        idSender: sender,
        idChat: chat,
        chatName: chatName,
        senderUsername: senderUsername,
        content: content
    }
})

exports.mqDeleteChat = ({ chat }) => ({
    type: messageTypes.CHAT_DELETE,
    chat: chat
})