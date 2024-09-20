const { userInChat } = require("../components/User")

const { isOidValid } = require.main.require("./components/Db")
const { createPage } = require.main.require("./components/Paging")
const { getChatNavigation } = require.main.require("./components/Chat")
const { parsePageNumber } = require.main.require("./components/Paging")
const { parseBool } = require.main.require("./components/Utils")
const { mqDeleteChat } = require.main.require("./components/Redis")

const chatServices = require.main.require("./services/Chat")
const messagesServices = require.main.require("./services/Message")
const usersServices = require.main.require("./services/User")
const { sendToUsers } = require.main.require("./services/Redis")

exports.getChat = async (req, res, next) => {
    try {
        const chat = await chatServices.getChat(req.params.id)
        if (!chat) return res.status(404).json({ message: "Chat not found with the specified id" })

        res.json(chat)
    } catch (err) { next(err) }
}

exports.getChatsPersonal = async (req, res, next) => {
    try {
        const { id } = req.user
        const page = parsePageNumber(req.query.page)
        const asc = parseBool(req.query.asc)
        const isGroup = parseBool(req.query.isGroup)

        let { chats, nPages } = await chatServices.getChatsAndCountPersonal(id, { page, asc, isGroup })

        // get names for non group chat
        // consider username denormalization better performance
        chats = await chatServices.lookupChatnames(chats, id, usersServices.getUser)

        res.json(createPage(page, nPages, { chats: chats }, getChatNavigation({ asc: asc, isGroup: isGroup })))
    } catch (err) { next(err) }
}

exports.createChat = async (req, res, next) => {
    try {
        const user = req.user
        const chat = req.body

        const userId = user.id.toString()
        const userIds = chat.users.map(({ id }) => id)

        const owner = chat.users.find(u => u.id === userId)

        // check creator inclusion and priviledge
        if (!owner) return res.status(401).json({ message: "Cannot create chat for others" })
        if (chat.isGroup && !owner.isAdmin) return res.status(400).json({ message: "User should be admin" })
        // check users id validity
        if (!usersServices.validateUsersIds(userIds)) return res.status(400).json({ message: "User ids not valid" })
        // check for user existence
        if (!(await usersServices.validateUsersExistence(userIds))) return res.status(400).json({ message: "User ids not recognized" })
        // check for direct chat existence: if a direct chat already exists return the id of the already existing
        if (!chat.isGroup) {
            const results = await chatServices.checkChatExistence(userIds)
            if (results) return res.json({ id: results.id.toString() })
        }

        const { insertedId } = await chatServices.createChat(chat)
        if (!insertedId) return res.status(304).json({ message: "No data has been created" })

        res.json({ id: insertedId.toString() })
    } catch (err) { next(err) }
}

exports.updateChat = async (req, res, next) => {
    try {
        const { id } = req.params
        const chatUpdate = req.body

        const chat = await chatServices.getChat(id)
        if (!chat.isGroup) return res.status(409).json({ message: "Only group chats can change name" })

        const { modifiedCount } = await chatServices.updateChat(id, chatUpdate)
        if (modifiedCount < 1) return res.status(304).json({ message: "No data has been modified" })

        res.end()
    } catch (err) { next(err) }
}

exports.deleteChat = async (req, res, next) => {
    try {
        const { id } = req.params

        // cannot perform bulk operation on multiple collections
        // first delete messages
        const { acknowledged } = await messagesServices.deleteMessages(id)
        if (!acknowledged) return res.status(304).json({ message: "No messages were deleted" })

        const { deletedCount } = await chatServices.deleteChat(id)
        if (deletedCount < 1) return res.status(304).json({ message: "No chat was deleted" })

        await sendToUsers(res.locals.chatUsers, JSON.stringify(mqDeleteChat({ chat: id })))

        res.end()
    } catch (err) { next(err) }
}

exports.getUsers = async (req, res, next) => {
    try {
        const chatUsersMap = await chatServices.getChatUsersMap(req.params.id)
        if (!chatUsersMap) return res.status(404).json({ message: "Chat users not found with the specified id" })

        const users = await usersServices.getChatUsers(chatUsersMap)

        res.json(users)
    } catch (err) { next(err) }
}

exports.addUser = async (req, res, next) => {
    try {
        const user = await usersServices.getUser({ id: req.params.idu })
        if (!user) return res.status(404).json({ message: "User not found with the specified id" })

        const { modifiedCount } = await chatServices.addUser(req.params.id, userInChat({ id: user.id, isAdmin: false }))
        if (modifiedCount < 1) return res.status(304).json({ message: "No data has been modified" })

        res.end()
    } catch (err) { next(err) }
}

exports.updateUser = async (req, res, next) => {
    try {
        const { modifiedCount } = await chatServices.updateUser(req.params.id, req.params.idu, req.body)
        if (modifiedCount < 1) return res.status(304).json({ message: "No data has been modified" })

        res.end()
    } catch (err) { next(err) }
}

exports.removeUser = async (req, res, next) => {
    try {
        const user = await usersServices.getUser({ id: req.params.idu })
        if (!user) return res.status(404).json({ message: "User not found with the specified id" })

        const { modifiedCount } = await chatServices.removeUser(req.params.id, req.params.idu)
        if (modifiedCount < 1) return res.status(304).json({ message: "No data has been modified" })

        res.end()
    } catch (err) { next(err) }
}