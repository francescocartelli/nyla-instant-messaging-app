const { userInChatPrefix } = require("../components/User")

const { oid } = require.main.require("./components/Db")

const { newChat, chatProj } = require.main.require('./components/Chat')
const { getChatCollection, configs: dbConfigs } = require.main.require('./components/Db')

const chatCollection = getChatCollection()

const personalChatsQuery = (idUser, { isGroup }) => ({
    users: { $elemMatch: { id: oid(idUser) } },
    ...(isGroup !== null ? { isGroup } : {})
})

/**
 * non clean utility: filter delegated to validator
 * @param {*} chat 
 * @returns 
 */
const createChat = (chat) => {
    return chatCollection.insertOne(newChat(chat))
}

const getChat = (idChat, project = true) => {
    return chatCollection.findOne(
        { _id: oid(idChat) },
        project ? { projection: chatProj } : {}
    )
}

const getChatsPersonal = (idUser, { page = 1, asc = false, isGroup = null }) => {
    return chatCollection
        .find(personalChatsQuery(idUser, { isGroup }), { projection: { ...chatProj, usersFull: '$users' } })
        .sort({ updatedAt: asc ? 1 : -1 }).limit(dbConfigs.CHATS_PER_PAGE)
        .skip(dbConfigs.CHATS_PER_PAGE * (page - 1)).toArray()
}

const countChatsPages = async (idUser, { isGroup = null }) => {
    const count = await chatCollection.countDocuments(personalChatsQuery(idUser, { isGroup }))

    return Math.ceil(count / dbConfigs.CHATS_PER_PAGE)
}

const getChatsAndCountPersonal = async (id, params) => {
    let [chats, nPages] = await Promise.all([
        getChatsPersonal(id, params),
        countChatsPages(id, params)
    ])

    return { chats, nPages }
}

const checkChatExistence = (users) => {
    if (users.length !== 2) throw new Error("Users must be two in a direct messages chat")
    return chatCollection.findOne({
        isGroup: false,
        $and: [
            { users: { $in: [oid(users[0])] } },
            { users: { $in: [oid(users[1])] } }
        ]
    }, { projection: { _id: 0, id: '$_id' } })
}

const updateChat = (idChat, chat) => {
    return chatCollection.updateOne(
        { _id: oid(idChat) },
        { $set: chat }
    )
}

const updateChatLog = (idChat) => {
    return chatCollection.updateOne(
        { _id: oid(idChat) },
        { $set: { updatedAt: new Date() } }
    )
}

const deleteChat = (idChat) => {
    return chatCollection.deleteOne({ _id: oid(idChat) })
}

const getChatUsers = async (idChat) => {
    const chat = await chatCollection.findOne({ _id: oid(idChat) })
    return chat && chat.users
}

const getChatUsersMap = async (idChat) => {
    const chatUsers = await getChatUsers(idChat)
    return chatUsers && Object.fromEntries(chatUsers.map(({ id, ...u }) => [id.toString(), u]))
}

const addUser = (idChat, user) => {
    return chatCollection.updateOne(
        { _id: oid(idChat) },
        { $push: { users: user } }
    )
}

const updateUser = (idChat, idUser, user) => {
    return chatCollection.updateOne(
        { _id: oid(idChat) },
        { $set: userInChatPrefix(user) },
        { arrayFilters: [{ 'u.id': oid(idUser) }] }
    )
}

const removeUser = (idChat, idUser) => {
    return chatCollection.updateOne(
        { _id: oid(idChat) },
        { $pull: { users: { id: oid(idUser) } } }
    )
}

const lookupChatname = (lookupUserUsername, idUser) => async ({ name, usersFull, ...c }) => {
    if (name) return { ...c, name }

    const userIdForUsername = usersFull.find(u => u.id.toString() !== idUser.toString())
    const { username } = userIdForUsername ? await lookupUserUsername({ id: userIdForUsername.id }) : { username: "" }
    return { ...c, name: username }
}

const lookupChatnames = (chats, id, lookupUserUsername) => {
    const lookup = lookupChatname(lookupUserUsername, id)

    return Promise.all(chats.map(lookup))
}

module.exports = {
    createChat,
    getChat,
    getChatsAndCountPersonal,
    checkChatExistence,
    updateChat,
    updateChatLog,
    deleteChat,
    getChatUsers,
    getChatUsersMap,
    addUser,
    updateUser,
    removeUser,
    lookupChatnames
}