const { oid } = require.main.require("./components/Db")

exports.newMessage = ({chat, sender, content}) => ({
    chat: oid(chat),
    sender: oid(sender),
    content: content,
    createdAt: new Date()
})

exports.getNextCursor = (messages) => {
    const length = messages.length
    return length > 0 ? messages[length - 1].id.toString() : null
}

exports.getMessageNavigation = (idChat) => (next) => `/api/chats/${idChat}/messages?cursor=${next}`

// projections
exports.messageProj = {
    _id: 0,
    id: '$_id',
    chat: { $concat: ["/api/chats/", { $toString: "$chat" }] },
    idChat: "$chat",
    sender: { $concat: ["/api/users/", { $toString: "$sender" }] },
    idSender: "$sender",
    content: 1,
    createdAt: 1
}