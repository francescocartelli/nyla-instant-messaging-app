const { notFoundId, SENDER_REQUIRED } = require("../constants/ResponseMessages")

const messageServices = require("../services/Message")

exports.isMessageAuthor = (idChatParam, idMessageParam) => async (req, res, next) => {
    try {
        const user = req.user
        const idChat = req.params[idChatParam]
        const idMessage = req.params[idMessageParam]

        const message = await messageServices.getMessage(idChat, idMessage)
        if (!message) return res.status(404).json({ message: notFoundId("message") })
        if (message.idSender.toString() !== user.id.toString()) return res.status(401).json({ message: SENDER_REQUIRED })

        res.locals.message = message

        next()
    } catch (err) { next(err) }
}
