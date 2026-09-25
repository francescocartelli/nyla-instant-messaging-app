import type { Response } from "express"
import type { ParamsDictionary } from "express-serve-static-core"

import { ADMIN_REQUIRED, NO_CHAT_DELETED, NO_MESSAGES_DELETED, notCreated, notFoundId, notModified, USER_IN_CHAT_REQUIRED } from "../constants/ResponseMessages.ts"

import { getChatNavigation } from "../utility/Navigation.ts"
import { createPage, parsePageNumber } from "../utility/Paging.ts"
import { parseBool } from "../utility/parsing/index.ts"

import chatServices from "../services/Chat.ts"
import * as messagesServices from "../services/Message.ts"
import * as mqServices from "../services/Mq.ts"
import usersServices from "../services/User.ts"

import { PublicChatFull } from "../model/Chat.ts"

import { AuthRequest } from "../types/AuthRequest.ts"
import { ChatCreate } from "../types/bodies/ChatCreate.ts"
import { ChatUserUpdate } from "../types/bodies/ChatUserUpdate.ts"

export const getChat = async (
    req: AuthRequest,
    res: Response
) => {
    const chat = await chatServices.getChat(req.params.id as string)
    if (!chat) return res.status(404).json({ message: notFoundId("chat") })

    res.json(chat)
}

export const getChatsPersonal = async (
    req: AuthRequest,
    res: Response
) => {
    const { id } = req.user
    const page = parsePageNumber(req.query.page as string)
    const asc = parseBool(req.query.asc as string)
    const isGroup = parseBool(req.query.isGroup as string)

    let { chats, nPages } = await chatServices.getChatsAndCountPersonal(id.toString(), { page, asc, isGroup })

    // get names for non group chat
    chats = await chatServices.lookupChatnames(chats, id.toString(), usersServices.getUser)

    res.json(createPage<Record<'chats', PublicChatFull[]>>(page, nPages, { chats }, getChatNavigation({ asc, isGroup })))
}

export const createChat = async (
    req: AuthRequest<{}, {}, ChatCreate>,
    res: Response
) => {
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

export const updateChat = async (req: AuthRequest, res: Response
) => {
    const { id } = req.params
    const chatUpdate = req.body

    const { modifiedCount } = await chatServices.updateChat(id.toString(), chatUpdate)
    if (modifiedCount < 1) return res.status(304).json({ message: notModified("chat") })

    res.end()
}

export const deleteChat = async (
    req: AuthRequest,
    res: Response
) => {
    const { id } = req.params

    const { acknowledged } = await messagesServices.deleteMessages(id.toString())
    if (!acknowledged) return res.status(304).json({ message: NO_MESSAGES_DELETED })

    const { deletedCount } = await chatServices.deleteChat(id.toString())
    if (deletedCount < 1) return res.status(304).json({ message: NO_CHAT_DELETED })

    mqServices.deleteChat(res.locals.chatUsers, { chat: id.toString() })

    res.end()
}

export const getUsers = async (
    req: AuthRequest,
    res: Response
) => {
    const chatUsersMap = await chatServices.getChatUsersMap(req.params.id as string)
    if (!chatUsersMap) return res.status(404).json({ message: notFoundId("chat user") })

    const users = await usersServices.getChatUsers(chatUsersMap)

    res.json(users)
}

export const addUser = async (
    req: AuthRequest,
    res: Response
) => {
    const idChat = req.params.id.toString()
    const idUser = req.params.idu.toString()

    const user = await usersServices.getUser({ id: idUser })
    if (!user) return res.status(404).json({ message: notFoundId("user") })

    const { modifiedCount } = await chatServices.addUser(idChat, { id: user.id.toString(), isAdmin: false })
    if (modifiedCount < 1) return res.status(304).json({ message: notModified("chat") })

    res.end()
}

export const updateUser = async (
    req: AuthRequest<ParamsDictionary, {}, ChatUserUpdate>,
    res: Response
) => {
    const { modifiedCount } = await chatServices.updateUser(req.params.id as string, req.params.idu as string, req.body)
    if (modifiedCount < 1) return res.status(304).json({ message: notModified("chat") })

    res.end()
}

export const removeUser = async (
    req: AuthRequest,
    res: Response
) => {
    const idChat = req.params.id.toString()
    const idUser = req.params.idu.toString()

    const { modifiedCount } = await chatServices.removeUser(idChat, idUser)
    if (modifiedCount < 1) return res.status(304).json({ message: notModified("chat") })

    res.end()
}

export const removeCurrentUser = async (
    req: AuthRequest,
    res: Response
) => {
    const idChat = req.params.id.toString()
    const user = req.user

    // no other user in chat after removal
    if (res.locals.chatUsers.length < 2) {
        const { acknowledged } = await messagesServices.deleteMessages(idChat)
        if (!acknowledged) return res.status(304).json({ message: NO_MESSAGES_DELETED })
    
        const { deletedCount } = await chatServices.deleteChat(idChat)
        if (deletedCount < 1) return res.status(304).json({ message: NO_CHAT_DELETED })
        
        return res.end()
    }

    const { modifiedCount } = await chatServices.removeUser(idChat, user.id.toString())
    if (modifiedCount < 1) return res.status(304).json({ message: notModified("chat") })

    res.end()
}