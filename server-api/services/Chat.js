const { userInChatPrefix, userInChat } = require("../model/User")
const { newChat } = require('../model/Chat')

const { oid, getChatCollection, configs: dbConfigs } = require('../config/Db')

const { evaluateModifiedResults } = require("../utility/Evaluate")

const chatProj = {
    _id: 0,
    id: '$_id',
    name: 1,
    users: { $concat: ["/api/chats/", { $toString: "$_id" }, "/users"] },
    nUsers: { $size: "$users" },
    messages: { $concat: ["/api/chats/", { $toString: "$_id" }, "/messages"] },
    isGroup: 1,
    createdAt: 1,
    updatedAt: 1
}

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
    return getChatCollection().insertOne(newChat(chat))
}

const getChat = (idChat, project = true) => {
    return getChatCollection().findOne(
        { _id: oid(idChat) },
        project ? { projection: chatProj } : {}
    )
}

const getChatsPersonal = (idUser, { page = 1, asc = false, isGroup = null, pageSize = dbConfigs.CHATS_PER_PAGE }) => {
    return getChatCollection()
        .find(personalChatsQuery(idUser, { isGroup }), { projection: { ...chatProj, usersFull: '$users' } })
        .sort({ updatedAt: asc ? 1 : -1 }).limit(pageSize)
        .skip(pageSize * (page - 1)).toArray()
}

const countChatsPages = async (idUser, { isGroup = null, pageSize = dbConfigs.CHATS_PER_PAGE }) => {
    const count = await getChatCollection().countDocuments(personalChatsQuery(idUser, { isGroup }))

    return Math.ceil(count / pageSize)
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
    return getChatCollection().findOne({
        isGroup: false,
        $and: [
            { users: { $in: [oid(users[0])] } },
            { users: { $in: [oid(users[1])] } }
        ]
    }, { projection: { _id: 0, id: '$_id' } })
}

const updateChat = (idChat, chat) => {
    return getChatCollection().updateOne(
        { _id: oid(idChat) },
        { $set: chat }
    )
}

const updateChatLog = (idChat) => {
    return getChatCollection().updateOne(
        { _id: oid(idChat) },
        { $set: { updatedAt: new Date() } }
    )
}

const deleteChat = (idChat) => {
    return getChatCollection().deleteOne({ _id: oid(idChat) })
}

const getChatUsers = async (idChat) => {
    const chat = await getChatCollection().findOne({ _id: oid(idChat) })
    return chat && chat.users
}

const getChatUsersMap = async (idChat) => {
    const chatUsers = await getChatUsers(idChat)
    return chatUsers && Object.fromEntries(chatUsers.map(({ id, ...u }) => [id.toString(), u]))
}

const addUser = (idChat, user) => {
    return getChatCollection().updateOne(
        { _id: oid(idChat) },
        { $push: { users: userInChat(user) } }
    )
}

const updateUser = (idChat, idUser, user) => {
    return getChatCollection().updateOne(
        { _id: oid(idChat) },
        { $set: userInChatPrefix(user) },
        { arrayFilters: [{ 'u.id': oid(idUser) }] }
    )
}

const removeUser = (idChat, idUser) => {
    return getChatCollection().updateOne(
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

const deleteUserChats = async idUser => {
    const chats = await getChatsPersonal(idUser, { pageSize: Infinity })

    const results = await Promise.all(chats.map(({ id: idChat, nUsers, isGroup }) => (!isGroup || nUsers < 2) ?
        deleteChat(idChat) :
        removeUser(idChat, idUser)
    ))

    return evaluateModifiedResults(results)
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
    lookupChatnames,
    deleteUserChats
}