const { newMessage, messageProj } = require('../components/Message')
const { oid, getMessageCollection, configs: dbConfigs } = require('../components/Db')

const messagesCollection = getMessageCollection()

exports.createMessage = (message) => {
    return messagesCollection.insertOne(newMessage(message))
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
