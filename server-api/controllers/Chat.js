import { ADMIN_REQUIRED, NO_CHAT_DELETED, NO_MESSAGES_DELETED, notCreated, notFoundId, notModified, USER_IN_CHAT_REQUIRED } from "../constants/ResponseMessages.js"

import { getChatNavigation } from "../utility/Navigation.js"
import { createPage, parsePageNumber } from "../utility/Paging.js"
import { parseBool } from "../utility/parsing/index.js"

import chatServices from "../services/Chat.js"
import * as messagesServices from "../services/Message.js"
import * as mqServices from "../services/Mq.js"
import usersServices from "../services/User.js"

export const getChat = async (req, res) => {
    const chat = await chatServices.getChat(req.params.id)
    if (!chat) return res.status(404).json({ message: notFoundId("chat") })

    res.json(chat)
}

export const getChatsPersonal = async (req, res) => {
    const { id } = req.user
    const page = parsePageNumber(req.query.page)
    const asc = parseBool(req.query.asc)
    const isGroup = parseBool(req.query.isGroup)

    let { chats, nPages } = await chatServices.getChatsAndCountPersonal(id, { page, asc, isGroup })

    // get names for non group chat
    // consider username denormalization better performance
    chats = await chatServices.lookupChatnames(chats, id, usersServices.getUser)

    res.json(createPage(page, nPages, { chats: chats }, getChatNavigation({ asc: asc, isGroup: isGroup })))
}

export const createChat = async (req, res) => {
    const user = req.user
    const chat = req.body

    const userId = user.id.toString()
    const userIds = chat.users.map(({ id }) => id)

    const owner = chat.users.find(u => u.id === userId)

    // check creator inclusion and priviledge
    if (!owner) return res.status(401).json({ message: USER_IN_CHAT_REQUIRED })
    if (chat.isGroup && !owner.isAdmin) return res.status(400).json({ message: ADMIN_REQUIRED })
    // check users id validity
    if (!usersServices.validateUsersIds(userIds)) return res.status(400).json({ message: "User ids not valid" })
    // check for user existence
    if (!(await usersServices.validateUsersExistence(userIds))) return res.status(400).json({ message: "User ids not recognized" })
    // check for direct chat existence: if a direct chat already exists return the id of the already existing
    if (!chat.isGroup) {
        const results = await chatServices.checkChatExistence(userIds)
        if (results) return res.json({ id: results.id.toString() })
    }

    const { insertedId } = await chatServices.createChat(chat)
    if (!insertedId) return res.status(304).json({ message: notCreated("chat") })

    res.json({ id: insertedId.toString() })
}

export const updateChat = async (req, res) => {
    const { id } = req.params
    const chatUpdate = req.body

    const { modifiedCount } = await chatServices.updateChat(id, chatUpdate)
    if (modifiedCount < 1) return res.status(304).json({ message: notModified("chat") })

    res.end()
}

export const deleteChat = async (req, res) => {
    const { id } = req.params

    const { acknowledged } = await messagesServices.deleteMessages(id)
    if (!acknowledged) return res.status(304).json({ message: NO_MESSAGES_DELETED })

    const { deletedCount } = await chatServices.deleteChat(id)
    if (deletedCount < 1) return res.status(304).json({ message: NO_CHAT_DELETED })

    mqServices.deleteChat(res.locals.chatUsers, { chat: id })

    res.end()
}

export const getUsers = async (req, res) => {
    const chatUsersMap = await chatServices.getChatUsersMap(req.params.id)
    if (!chatUsersMap) return res.status(404).json({ message: notFoundId("chat user") })

    const users = await usersServices.getChatUsers(chatUsersMap)

    res.json(users)
}

export const addUser = async (req, res) => {
    const idChat = req.params.id
    const idUser = req.params.idu

    const user = await usersServices.getUser({ id: idUser })
    if (!user) return res.status(404).json({ message: notFoundId("user") })

    const { modifiedCount } = await chatServices.addUser(idChat, { id: user.id, isAdmin: false })
    if (modifiedCount < 1) return res.status(304).json({ message: notModified("chat") })

    res.end()
}

export const updateUser = async (req, res) => {
    const { modifiedCount } = await chatServices.updateUser(req.params.id, req.params.idu, req.body)
    if (modifiedCount < 1) return res.status(304).json({ message: notModified("chat") })

    res.end()
}

export const removeUser = async (req, res) => {
    const idChat = req.params.id
    const idUser = req.params.idu

    const { modifiedCount } = await chatServices.removeUser(idChat, idUser)
    if (modifiedCount < 1) return res.status(304).json({ message: notModified("chat") })

    res.end()
}

export const removeCurrentUser = async (req, res) => {
    const idChat = req.params.id
    const user = req.user

    // no other user in chat after removal
    if (res.locals.chatUsers.length < 2) {
        const { acknowledged } = await messagesServices.deleteMessages(idChat)
        if (!acknowledged) return res.status(304).json({ message: NO_MESSAGES_DELETED })
    
        const { deletedCount } = await chatServices.deleteChat(idChat)
        if (deletedCount < 1) return res.status(304).json({ message: NO_CHAT_DELETED })
        
        return res.end()
    }

    const { modifiedCount } = await chatServices.removeUser(idChat, user.id)
    if (modifiedCount < 1) return res.status(304).json({ message: notModified("chat") })

    res.end()
}