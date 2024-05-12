const chatServices = require.main.require('./services/Chat')

exports.isUserInChat = (idParam) => {
    return async (req, res, next) => {
        const user = req.user
        const idChat = req.params[idParam]

        try {
            const users = await chatServices.getChatUsersIds(idChat)
            const chat = await chatServices.getChat(idChat)
            if (users) {
                if (users.includes(user.id.toString())) {
                    res.locals.chatUsers = users
                    res.locals.chatName = chat.name
                    next()
                } else res.status(401).send("Only chat users can perform this operation")
            } else res.status(404).send("Chat not found with the specified id")
        } catch (err) {
            console.log(err)
            res.status(500).send(err)
        }
    }
}
