const { oid } = require("../config/Db")

exports.newUser = ({ username, email, provider = null, hash = null, confirmed = false }) => ({
    username,
    email,
    bio: "",
    provider,
    hash,
    confirmed,
    createdAt: new Date()
})

exports.userInChat = ({ id, isAdmin }) => ({
    id: oid(id),
    isAdmin,
    joinedAt: new Date()
})

exports.userInDirectChat = ({ id }) => ({
    id: oid(id)
})

exports.userInChatPrefix = (user, prefix = "users.$[u]") => Object.fromEntries(Object.entries(user).flatMap(([key, value]) => value === null || value === undefined ? [] : [[`${prefix}.${key}`, value]]))