const { oid } = require.main.require("./components/Db")

exports.newUser = ({ username, email, hash }) => ({
    username: username,
    email: email,
    bio: "",
    hash: hash,
    confirmed: false,
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

exports.userInChatPrefix = (user, prefix="users.$[u]") => Object.fromEntries(Object.entries(user).flatMap(([key, value]) => value === null || value === undefined ? [] : [[`${prefix}.${key}`,value]]))

// projections
exports.userProjection = {
    _id: 0,
    id: '$_id',
    username: 1,
    bio: 1,
    confirmed: 1
}