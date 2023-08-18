const { ObjectId } = require("mongodb")

exports.newChat = function ({ name, users, isGroup }) {
    return {
        name: isGroup ? name : null,
        users: users.map(u => new ObjectId(u)),
        isGroup: isGroup,
        createdAt: new Date(),
        updatedAt: new Date()
    }
}

exports.pagingChat = function (page, nPages, chats) {
    return {
        page: page,
        nPages: nPages,
        chats: chats,
        prev: page > 1 ? `/api/chats/personal?page=${page - 1}` : null,
        next: page < nPages ? `/api/chats/personal?page=${page + 1}` : null
    }
}

// projections
exports.chatProj = {
    _id: 0,
    id: '$_id',
    name: 1,
    users: { $concat: ["/api/chats/", { $toString: "$_id" }, "/users"] },
    messages: { $concat: ["/api/chats/", { $toString: "$_id" }, "/messages"] },
    isGroup: 1,
    createdAt: 1,
    updatedAt: 1
}


