const { ObjectId } = require("mongodb")

exports.newMessage = ({chat, sender, content}) => {
    return {
        chat: new ObjectId(chat),
        sender: new ObjectId(sender),
        content: content,
        createdAt: new Date()
    }
}

exports.getMessageNavigation = (idChat) => {
    return (next) => `/api/chats/${idChat}/messages?cursor=${next}`
}

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