import { configs as dbConfigs, getMessageCollection, oid } from '../config/Db.js'

const messageProj = {
    _id: 0,
    id: '$_id',
    chat: { $concat: ["/api/chats/", { $toString: "$chat" }] },
    idChat: "$chat",
    sender: { $concat: ["/api/users/", { $toString: "$sender" }] },
    idSender: "$sender",
    content: 1,
    repliedTo: 1,
    createdAt: 1,
    updatedAt: 1,
    deletedAt: 1
}

const tenMinutesMillis = 10 * 60 * 1000

export const getMessage = (idChat, idMessage) => {
    return getMessageCollection().findOne({
        _id: oid(idMessage),
        chat: oid(idChat)
    }, { projection: messageProj })
}

const createRepliedTo = ({ id, idSender, content, createdAt }) => ({
    id: oid(id),
    idSender: oid(idSender),
    content,
    createdAt
})

export const createMessage = ({ chat, sender, content, repliedTo }) => {
    return getMessageCollection().insertOne({
        chat: oid(chat),
        sender: oid(sender),
        content,
        ...(repliedTo ? { repliedTo: createRepliedTo(repliedTo) } : {}),
        createdAt: new Date()
    })
}

export const updateMessage = (idChat, idMessage, { content }) => {
    return getMessageCollection().findOneAndUpdate({
        _id: oid(idMessage),
        chat: oid(idChat)
    }, {
        $set: {
            content,
            updatedAt: new Date()
        }
    }, {
        projection: messageProj,
        returnDocument: 'after',
        includeResultMetadata: true
    })
}

export const getMessages = (idChat, cursor) => {
    const query = cursor ? {
        $and: [
            { chat: oid(idChat) },
            { _id: { $lt: oid(cursor) } }
        ]
    } : { chat: oid(idChat) }

    return getMessageCollection().find(query, { projection: messageProj })
        .sort({ createdAt: -1 }).limit(dbConfigs.MESSAGES_PER_PAGE).toArray()
}

export const deleteMessage = (idChat, idMessage) => {
    return getMessageCollection().deleteOne({
        _id: oid(idMessage),
        chat: oid(idChat)
    })
}

export const markMessageDeleted = (idChat, idMessage) => {
    return getMessageCollection().findOneAndUpdate({
        _id: oid(idMessage),
        chat: oid(idChat)
    }, {
        $set: {
            content: null,
            deletedAt: new Date()
        }
    }, {
        projection: messageProj,
        returnDocument: 'after',
        includeResultMetadata: true
    })
}

export const deleteMessages = (idChat) => {
    return getMessageCollection().deleteMany({ chat: oid(idChat) })
}

export const countMessagesPages = async (idChat) => {
    const count = await getMessageCollection().countDocuments({ chat: oid(idChat) })
    return Math.ceil(count / dbConfigs.MESSAGES_PER_PAGE)
}

const isUpdateExpired = ({ createdAt }, delay = tenMinutesMillis) => {
    const maxDt = (new Date(createdAt)).getTime() + delay
    const nowDt = (new Date()).getTime()

    return nowDt > maxDt
}

const isMessageDeleted = ({ deletedAt }) => {
    return Boolean(deletedAt)
}

export const canUpdateMessage = message => {
    return !isUpdateExpired(message) && !isMessageDeleted(message)
}
