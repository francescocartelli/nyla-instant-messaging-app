const { userInChat, userInDirectChat } = require.main.require("./components/User")

exports.newChat = ({ name, users, isGroup }) => ({
    name: isGroup ? name : null,
    users: users.map(isGroup ? userInChat : userInDirectChat),
    isGroup,
    createdAt: new Date(),
    updatedAt: new Date()
})

exports.getChatNavigation = ({ asc, isGroup }) => {
    const endpoint = "/api/chats/personal"
    const params = `&asc=${asc}&isGroup=${isGroup}`

    return (page) => `${endpoint}?page=${page}${params}`
}

// projections
exports.chatProj = {
    _id: 0,
    id: '$_id',
    name: 1,
    users: { $concat: ["/api/chats/", { $toString: "$_id" }, "/users"] },
    nUsers: { $size: "$users" },
    messages: { $concat: ["/api/chats/", { $toString: "$_id" }, "/messages"] },
    isGroup: 1,
    createdAt: 1,
    updatedAt: 1
}


