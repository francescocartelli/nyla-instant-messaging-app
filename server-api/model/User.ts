import { oid } from "../config/Db.js"

export const newUser = ({ username, email, provider = null, hash = null, confirmed = false }) => ({
    username,
    email,
    bio: "",
    provider,
    hash,
    confirmed,
    createdAt: new Date()
})

export const userInChat = ({ id, isAdmin }) => ({
    id: oid(id),
    isAdmin,
    joinedAt: new Date()
})

export const userInDirectChat = ({ id }) => ({
    id: oid(id)
})

export const userInChatPrefix = (user, prefix = "users.$[u]") => Object.fromEntries(Object.entries(user).flatMap(([key, value]) => value === null || value === undefined ? [] : [[`${prefix}.${key}`, value]]))