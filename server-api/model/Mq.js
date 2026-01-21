const messageTypes = {
    MESSAGE_CREATE: 'MESSAGE_CREATE',
    MESSAGE_UPDATE: 'MESSAGE_UPDATE',
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

exports.mqUpdateMessage = ({ id, sender, chat, content, chatName, senderUsername, createdAt, updatedAt }) => ({
    type: messageTypes.MESSAGE_UPDATE,
    chat: chat,
    message: {
        id: id,
        idSender: sender,
        idChat: chat,
        chatName,
        senderUsername,
        content,
        createdAt,
        updatedAt
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