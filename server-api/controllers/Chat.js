const { ObjectId } = require("mongodb")

const usersServices = require("../services/User")
const chatServices = require.main.require('./services/Chat')

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
        const chat = await chatServices.getChatsPersonal(id.toString())

        res.json(chat)
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

        const { modifiedCount } = await chatServices.updateChat(id, chatUpdate)

        if (modifiedCount) res.end()
        else res.status(304).json("No data has been modified")
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