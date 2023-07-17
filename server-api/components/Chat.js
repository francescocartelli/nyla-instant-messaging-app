const { ObjectId } = require("mongodb")

exports.newChat = function (c) {
    return {
        name: c.isGroup ? c.name : null,
        users: c.users.map(u => new ObjectId(u)),
        isGroup: c.isGroup
    }
}