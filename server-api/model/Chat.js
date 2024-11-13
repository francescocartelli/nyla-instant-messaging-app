const { userInChat, userInDirectChat } = require("./User")

exports.newChat = ({ name, users, isGroup }) => ({
    name: isGroup ? name : null,
    users: users.map(isGroup ? userInChat : userInDirectChat),
    isGroup,
    createdAt: new Date(),
    updatedAt: new Date()
})