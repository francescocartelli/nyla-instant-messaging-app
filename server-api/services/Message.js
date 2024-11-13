const { oid, getMessageCollection, configs: dbConfigs } = require('../config/Db')

const messagesCollection = getMessageCollection()

const messageProj = {
    _id: 0,
    id: '$_id',
    chat: { $concat: ["/api/chats/", { $toString: "$chat" }] },
    idChat: "$chat",
    sender: { $concat: ["/api/users/", { $toString: "$sender" }] },
    idSender: "$sender",
    content: 1,
    createdAt: 1
}

exports.createMessage = ({chat, sender, content}) => {
    return messagesCollection.insertOne({
        chat: oid(chat),
        sender: oid(sender),
        content: content,
        createdAt: new Date()
    })
}

exports.getMessage = (idChat, idMessage) => {
    return messagesCollection.findOne({
        _id: oid(idMessage),
        chat: oid(idChat)
    }, { projection: messageProj })
}

exports.getMessages = (idChat, cursor) => {
    const query = cursor ? {
        $and: [
            { chat: oid(idChat) },
            { _id: { $lt: oid(cursor) } }
        ]
    } : { chat: oid(idChat) }

    return messagesCollection.find(query, { projection: messageProj })
        .sort({ createdAt: -1 }).limit(dbConfigs.MESSAGES_PER_PAGE).toArray()
}

exports.deleteMessage = (idChat, idMessage) => {
    return messagesCollection.deleteOne({
        _id: oid(idMessage),
        chat: oid(idChat)
    })
}

exports.deleteMessages = (idChat) => {
    return messagesCollection.deleteMany({ chat: oid(idChat) })
}

exports.countMessagesPages = async (idChat) => {
    const count = await messagesCollection.countDocuments({ chat: oid(idChat) })
    return Math.ceil(count / dbConfigs.MESSAGES_PER_PAGE)
}
