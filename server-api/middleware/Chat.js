const chatServices = require.main.require("./services/Chat")

exports.isUserInChat = (idParam, isAdminRequired = false) => async (req, res, next) => {
    try {
        const user = req.user
        const idChat = req.params[idParam]

        const chat = await chatServices.getChat(idChat, false)
        if (!chat) return res.status(404).json({ message: "Chat not found with the specified id" })

        const userInChat = chat.users.find(u => u.id.toString() === user.id.toString())
        if (!userInChat) return res.status(401).json({ message: "Only chat users can perform this operation" })
        if (chat.isGroup && isAdminRequired && !userInChat.isAdmin) return res.status(401).json({ message: "Only chat administrators can perform this operation" })

        res.locals.chatUsers = chat.users.map(({ id }) => id.toString())
        res.locals.chatName = chat.name

        next()
    } catch (err) { next(err) }
}
