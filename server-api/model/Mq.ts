const messageTypes = {
    MESSAGE_CREATE: 'MESSAGE_CREATE',
    MESSAGE_UPDATE: 'MESSAGE_UPDATE',
    MESSAGE_DELETE: 'MESSAGE_DELETE',
    CHAT_DELETE: 'CHAT_DELETE'
}

const createRepliedTo = ({ id, idSender, content, createdAt }) => ({
    id: id.toString(),
    idSender: idSender.toString(),
    content,
    createdAt
})

export const mqCreateMessage = ({ id, sender, chat, content, chatName, senderUsername, repliedTo }) => ({
    type: messageTypes.MESSAGE_CREATE,
    chat: chat,
    message: {
        id,
        idChat: chat,
        chatName,
        idSender: sender,
        senderUsername,
        content,
        ...(repliedTo ? { repliedTo: createRepliedTo(repliedTo) } : {})
    }
})

export const mqUpdateMessage = ({ id, sender, chat, content, chatName, senderUsername, createdAt, updatedAt }) => ({
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

export const mqDeleteMessage = ({ id, sender, chat, content, chatName, senderUsername, deletedAt }) => ({
    type: messageTypes.MESSAGE_DELETE,
    chat: chat,
    message: {
        id: id,
        idSender: sender,
        idChat: chat,
        chatName: chatName,
        senderUsername: senderUsername,
        content,
        deletedAt
    }
})

export const mqDeleteChat = ({ chat }) => ({
    type: messageTypes.CHAT_DELETE,
    chat: chat
})