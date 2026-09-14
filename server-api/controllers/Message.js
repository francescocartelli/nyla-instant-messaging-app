import { notCreated, notDeleted, notFoundId, TOO_LATE } from "../constants/ResponseMessages.js"

import chatServices from "../services/Chat.js"
import * as messageServices from "../services/Message.js"
import * as mqServices from "../services/Mq.js"

import { getMessageNavigation } from "../utility/Navigation.js"
import { createPageCursor } from "../utility/Paging.js"
import { parseNull } from "../utility/parsing/index.js"

export const getMessage = async (req, res) => {
    const { id: idChat, idm: idMessage } = req.params

    const message = await messageServices.getMessage(idChat, idMessage)
    if (!message) return res.status(404).json({ message: notFoundId("message") })

    res.json(message)
}

export const getMessages = async (req, res) => {
    const idChat = req.params.id
    const cursor = parseNull(req.query.cursor)

    const messages = await messageServices.getMessages(idChat, cursor)
    const next = messages[messages.length - 1]?.id.toString() || null

    res.json(createPageCursor({
        items: { messages: messages },
        nextCursor: next,
        next: getMessageNavigation(idChat, next)
    }))
}

export const createMessage = async (req, res, next) => {
    const {
        user: { id: sender, username },
        body: { repliedToId: repliedToId, content },
        params: { id: chat }
    } = req

    // evalutate reply
    let repliedTo = null
    if (repliedToId) {
        repliedTo = await messageServices.getMessage(chat, repliedToId)
        if (!repliedTo) return res.status(404).json({ message: notFoundId("referenced message") })
    }

    const newMessage = {
        chat,
        sender,
        content,
        chatName: res.locals.chatName,
        senderUsername: username,
        repliedTo
    }

    // write on db
    const { insertedId: id } = await messageServices.createMessage(newMessage)
    if (!id) return res.status(304).json({ message: notCreated("message") })

    chatServices.updateChatLog(chat)

    // write on mq
    mqServices.createMessage(res.locals.chatUsers, { id, ...newMessage })

    return res.json({ id })
}

export const updateMessage = async (req, res) => {
    const { user, params: { id: idChat, idm: idMessage }, body: messageUpdate } = req
    const { message } = res.locals

    if (!messageServices.canUpdateMessage(message)) return res.status(410).json({ message: TOO_LATE })

    const { value: updatedMessage, ok: isModified } = await messageServices.updateMessage(idChat, idMessage, messageUpdate)
    if (!isModified) return res.status(304).json({ message: notModified() })

    mqServices.updateMessage(res.locals.chatUsers, {
        ...updatedMessage,
        chat: idChat,
        chatName: res.locals.chatName,
        sender: user.id,
        senderUsername: user.username
    })

    chatServices.updateChatLog(idChat)

    res.end()
}

export const deleteMessage = async (req, res) => {
    const { params: { id: idChat, idm: idMessage }, user } = req

    const { value: deletedMessage, ok: isModified } = await messageServices.markMessageDeleted(idChat, idMessage)
    if (!isModified) return res.status(304).json({ message: notDeleted("message") })

    // send message on mq
    mqServices.deleteMessage(res.locals.chatUsers, {
        ...deletedMessage,
        chat: idChat,
        chatName: res.locals.chatName,
        sender: user.id,
        senderUsername: user.username
    })

    res.end()
}