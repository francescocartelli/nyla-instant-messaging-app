import type { NextFunction, Response } from "express"

import { ADMIN_REQUIRED, GROUP_CHATS_OPERATION, USER_IN_CHAT_REQUIRED, notFoundId } from "../constants/texts.ts"

import { Chat, GroupChatMember } from "../model/Chat.ts"

import chatServices from "../services/Chat.ts"
import { AuthRequest } from "../types/AuthRequest.ts"

export const isUserInChat = (idParam: string, { isAdminRequired = false, isGroupRequired = false } = {}) => async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const idChat = req.params[idParam] as string

    const chat = await chatServices.getChat(idChat, false) as Chat
    if (!chat) return res.status(404).json({ message: notFoundId("chat") })

    if (isGroupRequired && !chat.isGroup) return res.status(400).json({ message: GROUP_CHATS_OPERATION })

    const userInChat = chat.users.find(u => u.id.toString() === user!.id.toString()) as GroupChatMember
    if (!userInChat) return res.status(401).json({ message: USER_IN_CHAT_REQUIRED })
    if (chat.isGroup && isAdminRequired && !userInChat.isAdmin) return res.status(401).json({ message: ADMIN_REQUIRED })

    res.locals.chatUsers = chat.users.map(({ id }) => id.toString())
    res.locals.chatName = chat.name
    res.locals.isGroup = chat.isGroup

    next()
}
