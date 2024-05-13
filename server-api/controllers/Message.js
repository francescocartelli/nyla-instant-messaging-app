const { getMessageNavigation } = require.main.require("./components/Message")
const { createPageCursor } = require.main.require("./components/Paging")
const { mqCreateMessage, mqDeleteMessage } = require.main.require("./components/Redis")
const { parseCursor } = require.main.require("./components/Utils")

const { sendToUsers } = require.main.require('./services/Redis')
const messageServices = require.main.require('./services/Message')
const chatServices = require.main.require('./services/Chat')

exports.getMessage = async (req, res) => {
    try {
        const [idChat, idMessage] = [req.params.id, req.params.idm]

        // get message messageServices
        const message = await messageServices.getMessage(idChat, idMessage)

        if (message) res.json(message)
        else req.status(404, "Message not found with specified ids")
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.getMessages = async (req, res) => {
    try {
        const idChat = req.params.id
        const cursor = parseCursor(req.query.cursor)

        const messages = await messageServices.getMessages(idChat, cursor)
        const length = messages.length
        const next = length > 0 ? messages[length - 1].id.toString() : null

        res.json(createPageCursor(next, { messages: messages }, getMessageNavigation(idChat)))
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.createMessage = async (req, res) => {
    try {
        const [user, message, idChat] = [req.user, req.body, req.params.id]
        // build message
        let newMessage = { chat: idChat, sender: user.id, ...message, chatName: res.locals.chatName, senderUsername: user.username }
        // write message on database
        const { insertedId } = await messageServices.createMessage(newMessage)
        if (insertedId) {
            // send message on mq
            await sendToUsers(res.locals.chatUsers, JSON.stringify(mqCreateMessage({ id: insertedId, ...newMessage })))
            // not a critical write
            chatServices.updateChatLog(idChat)
            res.json({ id: insertedId })
        } else res.status(304).json("No data has been created")
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.deleteMessage = async (req, res) => {
    try {
        const [idChat, idMessage, user] = [req.params.id, req.params.idm, req.user]

        const message = await messageServices.getMessage(idChat, idMessage)
        if (!message) return res.status(404).json("Message not found with specified ids")
        else if (message.idSender.toString() !== user.id.toString()) return res.status(401).json("Only the sender can delete the message")

        const { deletedCount } = await messageServices.deleteMessage(idChat, idMessage)
        if (deletedCount > 0) {
            // send message on mq
            await sendToUsers(res.locals.chatUsers, JSON.stringify(mqDeleteMessage({ id: idMessage, chat: idChat })))
            res.end()
        } else res.status(304).json("No data has been deleted")
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}