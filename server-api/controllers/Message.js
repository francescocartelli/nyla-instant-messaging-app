const { pagingMessage } = require("../components/Message")

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
        const page = getPage(req.query.page)

        const [messages, nPages] = await Promise.all([
            messageServices.getMessages(idChat, page),
            messageServices.countMessagesPages(idChat)
        ])

        res.json(pagingMessage(page, nPages, messages, idChat))
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