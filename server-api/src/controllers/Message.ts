import type { Response } from "express"

import { notCreated, notDeleted, notFoundId, notModified, TOO_LATE } from "../constants/texts.ts"

import chatServices from "../services/Chat.ts"
import * as messageServices from "../services/Message.ts"
import * as mqServices from "../services/Mq.ts"

import { getMessageNavigation } from "../utility/navigation.ts"
import { createPageCursor } from "../utility/pagination.ts"
import { parseNull } from "../utility/parsing/index.ts"

import { Content, RepliedTo } from "../model/Message.ts"

import { AuthRequest } from "../types/AuthRequest.ts"

export const getMessage = async (req: AuthRequest, res: Response) => {
    const { id: idChat, idm: idMessage } = req.params

    const message = await messageServices.getMessage(idChat as string, idMessage as string)
    if (!message) return res.status(404).json({ message: notFoundId("message") })

    res.json(message)
}

export const getMessages = async (req: AuthRequest, res: Response) => {
    const idChat = req.params.id
    const cursor = parseNull(req.query.cursor as string)

    const messages = await messageServices.getMessages(idChat as string, cursor)
    const next = messages[messages.length - 1]?.id.toString() || null

    res.json(createPageCursor({
        items: { messages: messages },
        nextCursor: next,
        next: getMessageNavigation(idChat as string, next as string)
    }))
}

export const createMessage = async (req: AuthRequest, res: Response) => {
    const {
        user: { id: sender, username },
        body: { repliedToId: repliedToId, content },
        params: { id: chat }
    } = req

    // evalutate reply
    let repliedTo = null
    if (repliedToId) {
        repliedTo = await messageServices.getMessage(chat as string, repliedToId)
        if (!repliedTo) return res.status(404).json({ message: notFoundId("referenced message") })
    }

    const newMessage = {
        chat: chat as string,
        sender: sender as string,
        content: content as Content,
        chatName: res.locals.chatName,
        senderUsername: username,
        repliedTo: repliedTo as RepliedTo
    }

    // write on db
    const { insertedId: id } = await messageServices.createMessage(newMessage)
    if (!id) return res.status(304).json({ message: notCreated("message") })

    chatServices.updateChatLog(chat as string)

    // write on mq
    mqServices.createMessage(res.locals.chatUsers, {
        id: id.toString(),
        ...newMessage,
        createdAt: new Date()
    })

    return res.json({ id })
}

export const updateMessage = async (req: AuthRequest, res: Response) => {
    const { user, params: { id: idChat, idm: idMessage }, body: messageUpdate } = req
    const { message } = res.locals

    if (!messageServices.canUpdateMessage(message)) return res.status(410).json({ message: TOO_LATE })

    const { value: updatedMessage, ok: isModified } = await messageServices.updateMessage(idChat as string, idMessage as string, messageUpdate)
    if (!isModified || !updatedMessage) return res.status(304).json({ message: notModified() })

    mqServices.updateMessage(res.locals.chatUsers, {
        ...updatedMessage,
        chat: idChat as string,
        chatName: res.locals.chatName,
        sender: user.id.toString(),
        senderUsername: user.username
    } as any)

    chatServices.updateChatLog(idChat as string)

    res.end()
}

export const deleteMessage = async (req: AuthRequest, res: Response) => {
    const { params: { id: idChat, idm: idMessage }, user } = req

    const { value: deletedMessage, ok: isModified } = await messageServices.markMessageDeleted(idChat as string, idMessage as string)
    if (!isModified) return res.status(304).json({ message: notDeleted("message") })

    // send message on mq
    mqServices.deleteMessage(res.locals.chatUsers, {
        ...deletedMessage,
        chat: idChat as string,
        chatName: res.locals.chatName,
        sender: user.id,
        senderUsername: user.username
    } as any)

    res.end()
}