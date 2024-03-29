const { ObjectId } = require('mongodb')

const mongo = require.main.require('./components/db')
const { newChat, chatProj } = require.main.require('./components/Chat')

const db = mongo.get()

/**
 * non clean utility: filter delegated to validator
 * @param {*} chat 
 * @returns 
 */
exports.createChat = function (chat) {
    return db.collection(db.collections.chat).insertOne(newChat(chat))
}

exports.getChat = function (idChat, project = true) {
    const options = project ? { projection: chatProj } : {}
    return db.collection(db.collections.chat).findOne({ _id: new ObjectId(idChat) }, options)
}

exports.getChatsPersonal = function (idUser, { page = 1, asc = false, isGroup = null }) {
    return db.collection(db.collections.chat)
        .find({
            users: { $in: [new ObjectId(idUser)] },
            ...(isGroup !== null ? { isGroup } : {})
        }, { projection: { ...chatProj, idUsers: '$users' } })
        .sort({ updatedAt: asc ? 1 : -1 }).limit(db.configs.CHATS_PER_PAGE)
        .skip(db.configs.CHATS_PER_PAGE * (page - 1)).toArray()
}

exports.countChatsPages = function (idUser, { isGroup = null }) {
    return new Promise((resolve, reject) => {
        db.collection(db.collections.chat).countDocuments({
            users: { $in: [new ObjectId(idUser)] },
            ...(isGroup !== null ? { isGroup } : {})
        }).then((count) => {
            resolve(Math.ceil(count / db.configs.CHATS_PER_PAGE))
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * only for direct chat
 * check if the two users are already in a direct chat
 */
exports.checkChatExistence = function (users) {
    if (users.length != 2) throw new Error("Users must be two in a direct messages chat")
    return db.collection(db.collections.chat).findOne({
        isGroup: false, $and: [
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
exports.updateChat = function (idChat, chat) {
    return db.collection(db.collections.chat).updateOne({ _id: new ObjectId(idChat) }, { $set: chat })
}

exports.updateChatLog = function (idChat) {
    return db.collection(db.collections.chat).updateOne({ _id: new ObjectId(idChat) }, { $set: { updatedAt: new Date() } })
}

exports.deleteChat = function (idChat) {
    return db.collection(db.collections.chat).deleteOne({ _id: new ObjectId(idChat) })
}

exports.getChatUsersIds = function (idChat) {
    return new Promise((resolve, reject) => {
        db.collection(db.collections.chat).findOne({ _id: new ObjectId(idChat) }).then(chat => {
            if (chat) resolve(chat.users.map(i => i.toString()))
            else resolve(null)
        }).catch(err => reject(err))
    })
}

exports.addUser = function (idChat, idUser) {
    return db.collection(db.collections.chat).updateOne(
        { _id: new ObjectId(idChat) },
        { $addToSet: { users: new ObjectId(idUser) } }
    )
}

exports.removeUser = function (idChat, idUser) {
    return db.collection(db.collections.chat).updateOne(
        { _id: new ObjectId(idChat) },
        { $pull: { users: new ObjectId(idUser) } }
    )
}