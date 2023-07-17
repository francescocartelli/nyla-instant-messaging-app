const { ObjectId } = require('mongodb')

const mongo = require.main.require('./components/db')
const { newChat } = require.main.require('./components/Chat')

const db = mongo.get()

const chatLimit = 10

const chatProj = {
    _id: 0,
    id: '$_id',
    name: 1,
    users: { $concat: ["/api/chats/", { $toString: "$_id" }, "/users"] },
    isGroup: 1
}

/**
 * non clean utility: filter delegated to validator
 * @param {*} chat 
 * @returns 
 */
exports.createChat = function (chat) {
    return db.collection(db.collections.chat).insertOne(newChat(chat))
}

exports.getChat = function (idChat) {
    return db.collection(db.collections.chat).findOne({ _id: new ObjectId(idChat) }, { projection: chatProj })
}

exports.getChatsPersonal = function (idUser, page = 0) {
    return db.collection(db.collections.chat)
        .find({ users: { $in: [new ObjectId(idUser)] } }, { projection: chatProj })
        .sort({ _id: -1 }).limit(chatLimit).skip(chatLimit * page).toArray(chatLimit)
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

exports.deleteChat = function (idChat) {
    return db.collection.deleteOne({ _id: new ObjectId(idChat) })
}

exports.getChatUsersIds = function (idChat) {
    return new Promise((resolve, reject) => {
        db.collection(db.collections.chat).findOne({ _id: new ObjectId(idChat) }).then(chat => {
            if (chat) resolve(chat.users.map(i => i.toString()))
            else resolve(null)
        }).catch(err => reject(err))
    })
}