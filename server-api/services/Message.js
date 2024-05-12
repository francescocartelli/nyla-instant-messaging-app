const { ObjectId } = require('mongodb')

const { newMessage, messageProj } = require.main.require('./components/Message')
const { getMessageCollection, configs: dbConfigs } = require.main.require('./components/Db')

const messagesCollection = getMessageCollection()

exports.createMessage = (message) => {
    return messagesCollection.insertOne(newMessage(message))
}

exports.getMessage = (idChat, idMessage) => {
    return messagesCollection.findOne({
        _id: new ObjectId(idMessage),
        chat: new ObjectId(idChat)
    }, { projection: messageProj })
}

exports.getMessages = (idChat, cursor) => {
    const query = cursor ? {
        $and: [
            { chat: new ObjectId(idChat) },
            { _id: { $lt: new ObjectId(cursor) } }
        ]
    } : { chat: new ObjectId(idChat) }

    return messagesCollection.find(query, { projection: messageProj })
        .sort({ createdAt: -1 }).limit(dbConfigs.MESSAGES_PER_PAGE).toArray()
}

exports.deleteMessage = (idChat, idMessage) => {
    return messagesCollection.deleteOne({
        _id: new ObjectId(idMessage),
        chat: new ObjectId(idChat)
    })
}

exports.deleteMessages = (idChat) => {
    return messagesCollection.deleteMany({ chat: new ObjectId(idChat) })
}

exports.countMessagesPages = async (idChat) => {
    const count = await messagesCollection.countDocuments({ chat: new ObjectId(idChat) })
    return Math.ceil(count / dbConfigs.MESSAGES_PER_PAGE)
}
