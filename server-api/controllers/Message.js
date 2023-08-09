const { pagingMessage } = require.main.require("./components/Message")
const { getCursor } = require.main.require("./components/utils")

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
        const cursor = getCursor(req.query.cursor)

        const messages = await messageServices.getMessages(idChat, cursor)
        const length = messages.length
        let next = undefined
        if (length > 0) next = messages[length - 1].id.toString()

        res.json(pagingMessage(messages, idChat, next))
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.createMessage = async (req, res) => {
    try {
        const [user, message, idChat] = [req.user, req.body, req.params.id]
        // build message
        let newMessage = { chat: idChat, sender: user.id, ...message }
        // write message on database
        const { insertedId } = await messageServices.createMessage(newMessage)
        if (insertedId) {
            // send message on mq
            await sendToUsers(res.locals.chatUsers, JSON.stringify({ id: insertedId, ...newMessage }))
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
        const [idChat, idMessage] = [req.params.id, req.params.idm]

        const { deletedCount } = await messageServices.deleteMessage(idChat, idMessage)

        if (deletedCount > 0) res.end()
        else res.status(304).json("No data has been deleted")
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}