const { ObjectId } = require("mongodb")

exports.newMessage = function ({chat, sender, content}) {
    return {
        chat: new ObjectId(chat),
        sender: new ObjectId(sender),
        content: content,
        createdAt: new Date()
    }
}

exports.pagingMessage = function (messages, idChat, next) {
    return {
        messages: messages,
        nextCursor: next,
        next: next ? `/api/chats/${idChat}/messages?cursor=${next}` : null
    }
}

// projections
exports.messageProj = {
    _id: 0,
    id: '$_id',
    chat: { $concat: ["/api/chats/", { $toString: "$chat" }] },
    idChat: "$chat",
    sender: { $concat: ["/api/users/", { $toString: "$sender" }] },
    idSender: "$sender",
    content: 1,
    createdAt: 1
}