const { pagingMessage } = require("../components/Message")
const { getCursor } = require("../components/utils")

const messageServices = require.main.require('./services/Message')
const { getPage } = require.main.require('./components/utils')

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

        const { insertedId } = await messageServices.createMessage({ chat: idChat, sender: user.id, ...message })

        if (insertedId) res.json({ id: insertedId })
        else res.status(304).json("No data has been created")
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