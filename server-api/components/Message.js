const { ObjectId } = require("mongodb")

exports.newMessage = function (m) {
    return {
        chat: new ObjectId(m.chat),
        sender: new ObjectId(m.sender),
        content: m.content,
        createdAt: new Date()
    }
}

exports.pagingMessage = function (page, nPages, messages, idChat) {
    return {
        page: page,
        nPages: nPages,
        messages: messages,
        prev: page > 0 ? `/api/chats/${idChat}/messages?page=${page - 1}` : null,
        next: page + 1 < nPages ? `/api/chats/${idChat}/messages?page=${page + 1}` : null
    }
}

// projections
exports.messageProj = {
    _id: 0,
    id: '$_id',
    chat: { $concat: ["/api/chats/", { $toString: "$chat" }] },
    sender: { $concat: ["/api/users/", { $toString: "$sender" }] },
    content: 1,
    createdAt: 1
}