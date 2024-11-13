const { ADMIN_REQUIRED, USER_IN_CHAT_REQUIRED, notFoundId } = require("../constants/ResponseMessages")

const chatServices = require("../services/Chat")

exports.isUserInChat = (idParam, isAdminRequired = false) => async (req, res, next) => {
    try {
        const user = req.user
        const idChat = req.params[idParam]

        const chat = await chatServices.getChat(idChat, false)
        if (!chat) return res.status(404).json({ message: notFoundId("chat") })

        const userInChat = chat.users.find(u => u.id.toString() === user.id.toString())
        if (!userInChat) return res.status(401).json({ message: USER_IN_CHAT_REQUIRED })
        if (chat.isGroup && isAdminRequired && !userInChat.isAdmin) return res.status(401).json({ message: ADMIN_REQUIRED })

        res.locals.chatUsers = chat.users.map(({ id }) => id.toString())
        res.locals.chatName = chat.name
        res.locals.isGroup = chat.isGroup

        next()
    } catch (err) { next(err) }
}
