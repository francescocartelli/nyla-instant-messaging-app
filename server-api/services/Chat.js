const { oid } = require.main.require("./components/Db")

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
        { _id: oid(idChat) },
        project ? { projection: chatProj } : {}
    )
}

exports.getChatsPersonal = (idUser, { page = 1, asc = false, isGroup = null }) => {
    return chatCollection
        .find({
            users: { $in: [oid(idUser)] },
            ...(isGroup !== null ? { isGroup } : {})
        }, { projection: { ...chatProj, idUsers: '$users' } })
        .sort({ updatedAt: asc ? 1 : -1 }).limit(dbConfigs.CHATS_PER_PAGE)
        .skip(dbConfigs.CHATS_PER_PAGE * (page - 1)).toArray()
}

exports.countChatsPages = async (idUser, { isGroup = null }) => {
    const count = await chatCollection.countDocuments({
        users: { $in: [oid(idUser)] },
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
            { users: { $in: [oid(users[0])] } },
            { users: { $in: [oid(users[1])] } }
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
        { _id: oid(idChat) },
        { $set: chat }
    )
}

exports.updateChatLog = (idChat) => {
    return chatCollection.updateOne(
        { _id: oid(idChat) },
        { $set: { updatedAt: new Date() } }
    )
}

exports.deleteChat = (idChat) => {
    return chatCollection.deleteOne({ _id: oid(idChat) })
}

exports.getChatUsersIds = async (idChat) => {
    const chat = await chatCollection.findOne({ _id: oid(idChat) })
    return chat && chat.users && chat.users.map(i => i.toString())
}

exports.addUser = (idChat, idUser) => {
    return chatCollection.updateOne(
        { _id: oid(idChat) },
        { $addToSet: { users: oid(idUser) } }
    )
}

exports.removeUser = (idChat, idUser) => {
    return chatCollection.updateOne(
        { _id: oid(idChat) },
        { $pull: { users: oid(idUser) } }
    )
}

exports.lookupChatname = (chats, id, lookupUserUsername) => {
    return Promise.all(chats.map(async ({ name, idUsers, ...c }) => {
        if (name) return { ...c, name }

        const userIdForUsername = idUsers.find(u => u.toString() !== id.toString())
        const { username } = await lookupUserUsername({ id: userIdForUsername })
        return { ...c, name: username }
    }))
}