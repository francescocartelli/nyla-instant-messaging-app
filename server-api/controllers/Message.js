const { SENDER_REQUIRED, notFoundId, notCreated, notDeleted } = require("../constants/ResponseMessages")

const messageServices = require("../services/Message")
const chatServices = require("../services/Chat")
const mqServices = require("../services/Mq")

const { createPageCursor } = require("../utility/Paging")
const { getMessageNavigation } = require("../utility/Navigation")
const { parseNull } = require("../utility/Parsing")

exports.getMessage = async (req, res) => {
    const [idChat, idMessage] = [req.params.id, req.params.idm]

    // get message messageServices
    const message = await messageServices.getMessage(idChat, idMessage)
    if (!message) return req.status(404).json({ message: notFoundId("message") })

    res.json(message)
}

exports.getMessages = async (req, res) => {
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

exports.createMessage = async (req, res) => {
    const [user, message, idChat] = [req.user, req.body, req.params.id]

    let newMessage = { chat: idChat, sender: user.id, ...message, chatName: res.locals.chatName, senderUsername: user.username }

    // write message on database
    const { insertedId } = await messageServices.createMessage(newMessage)
    if (!insertedId) return res.status(304).json({ message: notCreated("message") })

    // send message on mq
    mqServices.createMessage(res.locals.chatUsers, { id: insertedId, ...newMessage })

    chatServices.updateChatLog(idChat)

    res.json({ id: insertedId })
}

exports.deleteMessage = async (req, res) => {
    const [idChat, idMessage, user] = [req.params.id, req.params.idm, req.user]

    const message = await messageServices.getMessage(idChat, idMessage)
    if (!message) return res.status(404).json({ message: notFoundId("message") })
    else if (message.idSender.toString() !== user.id.toString()) return res.status(401).json({ message: SENDER_REQUIRED })

    const { deletedCount } = await messageServices.deleteMessage(idChat, idMessage)
    if (deletedCount < 1) return res.status(304).json({ message: notDeleted("message") })

    // send message on mq
    mqServices.deleteMessage(res.locals.chatUsers, { id: idMessage, chat: idChat })

    res.end()
}