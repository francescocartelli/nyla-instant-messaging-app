exports.mqCreateMessage = function ({ id, sender, chat, content }) {
    return {
        type: "MESSAGE_CREATE",
        chat: chat,
        message: { id: id, idSender: sender, idChat: chat, content: content }
    }
}

exports.mqDeleteMessage = function ({ id, sender, chat, content }) {
    return {
        type: "MESSAGE_DELETE",
        chat: chat,
        message: { id: id, idSender: sender, idChat: chat, content: content }
    }
}

exports.mqDeleteChat = function ({ chat }) {
    return {
        type: "CHAT_DELETE",
        chat: chat
    }
}