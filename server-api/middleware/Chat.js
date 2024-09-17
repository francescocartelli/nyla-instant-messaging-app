const chatServices = require.main.require("./services/Chat")

exports.isUserInChat = (idParam) => async (req, res, next) => {
    try {
        const user = req.user
        const idChat = req.params[idParam]

        const chat = await chatServices.getChat(idChat, false)
        if (!chat) return res.status(404).json({ message: "Chat not found with the specified id" })

        const name = chat.name
        const users = chat.users.map(i => i.toString())

        if (!users.includes(user.id.toString())) return res.status(401).json({ message: "Only chat users can perform this operation" })

        res.locals.chatUsers = users
        res.locals.chatName = name

        next()
    } catch (err) { next(err) }
}
