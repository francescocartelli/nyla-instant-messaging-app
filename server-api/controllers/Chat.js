const { ObjectId } = require("mongodb")

const { pagingChat } = require.main.require("./components/Chat")
const { getPage, getBool } = require.main.require("./components/utils")
const { mqDeleteChat } = require.main.require("./components/Redis")

const chatServices = require.main.require('./services/Chat')
const messagesServices = require.main.require("./services/Message")
const usersServices = require.main.require("./services/User")
const { sendToUsers } = require.main.require('./services/Redis')

exports.getChat = async (req, res) => {
    try {
        const chat = await chatServices.getChat(req.params.id)

        if (chat) res.json(chat)
        else res.status(404).json("Chat not found with the specified id")
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.getChatsPersonal = async (req, res) => {
    try {
        const { id } = req.user
        const page = getPage(req.query.page)
        const asc = getBool(req.query.asc)

        let [chats, nPages] = await Promise.all([
            chatServices.getChatsPersonal(id.toString(), page, asc),
            chatServices.countChatsPages(id.toString())
        ])
        // get names for non group chat
        // consider username denormalization better performance
        chats = await Promise.all(chats.map(async ({name, idUsers, ...c}) => {
            const userIdForUsername = idUsers.find(u => u.toString() !== id.toString())
            const n = c.isGroup ? name : (await usersServices.getUser(userIdForUsername)).username
            return {...c, name: n}
        }))
        
        res.json(pagingChat(page, nPages, chats))
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.createChat = async (req, res) => {
    try {
        const user = req.user
        const chat = req.body
        // check creator inclusion
        if (!chat.users.includes(user.id.toString())) return res.status(400).json("Cannot create chat for others")
        // check ids validity
        const validIds = chat.users.map((userId) => ObjectId.isValid(userId))
        if (!validIds.every(i => i)) return res.status(400).json("User ids not valid")
        // check for user existence
        const existingIds = await Promise.all(chat.users.map((userId) => usersServices.getUserId(userId)))
        if (!existingIds.every(i => i)) return res.status(400).json("User ids not recognized")
        // check for direct chat existence
        if (!chat.isGroup) {
            // if a direct chat already exists return the id of the already existing
            const results = await chatServices.checkChatExistence(chat.users)
            if (results) return res.json({ id: results.id })
        }
        const { insertedId } = await chatServices.createChat(chat)
        if (insertedId) res.json({ id: insertedId })
        else res.status(304).json("No data has been created")
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.updateChat = async (req, res) => {
    try {
        const id = req.params.id
        const chatUpdate = req.body

        const chat = await chatServices.getChat(id)
        if (!chat.isGroup) return res.status(409).json("Only group chats can change name")

        const { modifiedCount } = await chatServices.updateChat(id, chatUpdate)
        if (modifiedCount) res.end()
        else res.status(304).json("No data has been modified")
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.deleteChat = async (req, res) => {
    try {
        const id = req.params.id

        // cannot perform bulk operation on multiple collections
        // first delete messages
        const { acknowledged } = await messagesServices.deleteMessages(id)
        if (!acknowledged) return res.status(304).json("No messages were deleted")

        const { deletedCount } = await chatServices.deleteChat(id)
        if (deletedCount > 0) {
            await sendToUsers(res.locals.chatUsers, JSON.stringify(mqDeleteChat({ chat: id })))
            res.end()
        }
        else res.status(304).json("No chat was deleted")
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.getUsers = async (req, res) => {
    try {
        const usersIds = await chatServices.getChatUsersIds(req.params.id)
        if (usersIds) {
            const users = await usersServices.getFullUsers(usersIds)
            res.json(users)
        } else res.status(404).json("Chat users not found with the specified id")
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.addUser = async (req, res) => {
    try {
        const user = await usersServices.getUser({ id: req.params.idu })
        if (user) {
            const { modifiedCount } = await chatServices.addUser(req.params.id, req.params.idu)

            if (modifiedCount > 0) res.end()
            else res.status(304).json("No data has been modified")
        } else res.status(404).json("User not found with the specified id")
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.removeUser = async (req, res) => {
    try {
        const user = await usersServices.getUser({ id: req.params.idu })
        if (user) {
            const { modifiedCount } = await chatServices.removeUser(req.params.id, req.params.idu)

            if (modifiedCount > 0) res.end()
            else res.status(304).json("No data has been modified")
        } else res.status(404).json("User not found with the specified id")
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}