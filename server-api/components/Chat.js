const { ObjectId } = require("mongodb")

exports.newChat = function (c) {
    return {
        name: c.isGroup ? c.name : null,
        users: c.users.map(u => new ObjectId(u)),
        isGroup: c.isGroup
    }
}

exports.pagingChat = function (page, nPages, chats) {
    return {
        page: page,
        nPages: nPages,
        chats: chats,
        prev: page > 0 ? `/api/chats/personal?page=${page - 1}` : null,
        next: page + 1 < nPages ? `/api/chats/personal?page=${page + 1}` : null
    }
}

// projections
exports.chatProj = {
    _id: 0,
    id: '$_id',
    name: 1,
    users: { $concat: ["/api/chats/", { $toString: "$_id" }, "/users"] },
    isGroup: 1
}
