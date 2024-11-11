const { SENDER_REQUIRED, notFoundId, notCreated, notDeleted } = require("../components/ResponseMessages")
const { getMessageNavigation, getNextCursor } = require("../components/Message")
const { createPageCursor } = require("../components/Paging")
const { mqCreateMessage, mqDeleteMessage } = require("../components/Redis")
const { isOidValid } = require("../components/Db")

const { broadcastMessage } = require("../services/Redis")
const messageServices = require("../services/Message")
const chatServices = require("../services/Chat")

exports.getMessage = async (req, res, next) => {
    try {
        const [idChat, idMessage] = [req.params.id, req.params.idm]

        // get message messageServices
        const message = await messageServices.getMessage(idChat, idMessage)
        if (!message) return req.status(404).json({ message: notFoundId("message") })

        res.json(message)
    } catch (err) { next(err) }
}

exports.getMessages = async (req, res, next) => {
    try {
        const idChat = req.params.id
        const cursor = isOidValid(req.query.cursor) ? req.query.cursor : undefined

        const messages = await messageServices.getMessages(idChat, cursor)
        const next = getNextCursor(messages)

        res.json(createPageCursor(next, { messages: messages }, getMessageNavigation(idChat)))
    } catch (err) { next(err) }
}

exports.createMessage = async (req, res, next) => {
    try {
        const [user, message, idChat] = [req.user, req.body, req.params.id]

        let newMessage = { chat: idChat, sender: user.id, ...message, chatName: res.locals.chatName, senderUsername: user.username }

        // write message on database
        const { insertedId } = await messageServices.createMessage(newMessage)
        if (!insertedId) return res.status(304).json({ message: notCreated("message") })

        // send message on mq
        await broadcastMessage(res.locals.chatUsers, JSON.stringify(mqCreateMessage({ id: insertedId, ...newMessage })))

        // not a critical write
        chatServices.updateChatLog(idChat)

        res.json({ id: insertedId })
    } catch (err) { next(err) }
}

exports.deleteMessage = async (req, res, next) => {
    try {
        const [idChat, idMessage, user] = [req.params.id, req.params.idm, req.user]

        const message = await messageServices.getMessage(idChat, idMessage)
        if (!message) return res.status(404).json({ message: notFoundId("message") })
        else if (message.idSender.toString() !== user.id.toString()) return res.status(401).json({ message: SENDER_REQUIRED })

        const { deletedCount } = await messageServices.deleteMessage(idChat, idMessage)
        if (deletedCount < 1) return res.status(304).json({ message: notDeleted("message") })

        // send message on mq
        await broadcastMessage(res.locals.chatUsers, JSON.stringify(mqDeleteMessage({ id: idMessage, chat: idChat })))

        res.end()
    } catch (err) { next(err) }
}