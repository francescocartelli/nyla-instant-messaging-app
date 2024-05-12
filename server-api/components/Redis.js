exports.mqCreateMessage = ({ id, sender, chat, content, chatName, senderUsername }) => {
    return {
        type: "MESSAGE_CREATE",
        chat: chat,
        message: {
            id: id,
            idSender: sender,
            idChat: chat,
            chatName: chatName,
            senderUsername: senderUsername,
            content: content
        }
    }
}

exports.mqDeleteMessage = ({ id, sender, chat, content, chatName, senderUsername }) => {
    return {
        type: "MESSAGE_DELETE",
        chat: chat,
        message: {
            id: id,
            idSender: sender,
            idChat: chat,
            chatName: chatName,
            senderUsername: senderUsername,
            content: content
        }
    }
}

exports.mqDeleteChat = ({ chat }) => {
    return {
        type: "CHAT_DELETE",
        chat: chat
    }
}