const { ObjectId } = require("mongodb")

exports.newMessage = function (m) {
    return {
        chat: new ObjectId(m.chat),
        sender: new ObjectId(m.sender),
        content: m.content,
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
    sender: { $concat: ["/api/users/", { $toString: "$sender" }] },
    senderId: "$sender",
    content: 1,
    createdAt: 1
}