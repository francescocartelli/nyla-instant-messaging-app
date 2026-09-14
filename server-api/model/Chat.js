import { userInChat, userInDirectChat } from "./User.js"

export const newChat = ({ name, users, isGroup }) => ({
    name: isGroup ? name : null,
    users: users.map(isGroup ? userInChat : userInDirectChat),
    isGroup,
    createdAt: new Date(),
    updatedAt: new Date()
})