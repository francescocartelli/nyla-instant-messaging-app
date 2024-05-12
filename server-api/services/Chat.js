const { ObjectId } = require('mongodb')

const { newChat, chatProj } = require.main.require('./components/Chat')
const { getChatCollection, configs: dbConfigs } = require.main.require('./components/Db')

const chatCollection = getChatCollection()

/**
 * non clean utility: filter delegated to validator
 * @param {*} chat 
 * @returns 
 */
exports.createChat = (chat) => {
    return chatCollection.insertOne(newChat(chat))
}

exports.getChat = (idChat, project = true) => {
    return chatCollection.findOne(
        { _id: new ObjectId(idChat) },
        project ? { projection: chatProj } : {}
    )
}

exports.getChatsPersonal = (idUser, { page = 1, asc = false, isGroup = null }) => {
    return chatCollection
        .find({
            users: { $in: [new ObjectId(idUser)] },
            ...(isGroup !== null ? { isGroup } : {})
        }, { projection: { ...chatProj, idUsers: '$users' } })
        .sort({ updatedAt: asc ? 1 : -1 }).limit(dbConfigs.CHATS_PER_PAGE)
        .skip(dbConfigs.CHATS_PER_PAGE * (page - 1)).toArray()
}

exports.countChatsPages = async (idUser, { isGroup = null }) => {
    const count = await chatCollection.countDocuments({
        users: { $in: [new ObjectId(idUser)] },
        ...(isGroup !== null ? { isGroup } : {})
    })

    return Math.ceil(count / dbConfigs.CHATS_PER_PAGE)
}

/**
 * only for direct chat
 * check if the two users are already in a direct chat
 */
exports.checkChatExistence = (users) => {
    if (users.length !== 2) throw new Error("Users must be two in a direct messages chat")
    return chatCollection.findOne({
        isGroup: false,
        $and: [
            { users: { $in: [new ObjectId(users[0])] } },
            { users: { $in: [new ObjectId(users[1])] } }
        ]
    }, { projection: { _id: 0, id: '$_id' } })
}

/**
 * non clean utility: filter delegated to validator
 * @param {*} idChat
 * @param {*} chat is an object of editable props 
 * @returns 
 */
exports.updateChat = (idChat, chat) => {
    return chatCollection.updateOne(
        { _id: new ObjectId(idChat) },
        { $set: chat }
    )
}

exports.updateChatLog = (idChat) => {
    return chatCollection.updateOne(
        { _id: new ObjectId(idChat) },
        { $set: { updatedAt: new Date() } }
    )
}

exports.deleteChat = (idChat) => {
    return chatCollection.deleteOne({ _id: new ObjectId(idChat) })
}

exports.getChatUsersIds = async (idChat) => {
    const chat = await chatCollection.findOne({ _id: new ObjectId(idChat) })
    return chat.users.map(i => i.toString())
}

exports.addUser = (idChat, idUser) => {
    return chatCollection.updateOne(
        { _id: new ObjectId(idChat) },
        { $addToSet: { users: new ObjectId(idUser) } }
    )
}

exports.removeUser = (idChat, idUser) => {
    return chatCollection.updateOne(
        { _id: new ObjectId(idChat) },
        { $pull: { users: new ObjectId(idUser) } }
    )
}