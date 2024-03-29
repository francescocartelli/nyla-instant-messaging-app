const { ObjectId } = require('mongodb')

const { newMessage, messageProj } = require.main.require('./components/Message')
const mongo = require.main.require('./components/db')

const db = mongo.get()

exports.createMessage = function (message) {
    return db.collection(db.collections.message).insertOne(newMessage(message))
}

exports.getMessage = function (idChat, idMessage) {
    return db.collection(db.collections.message).findOne({ _id: new ObjectId(idMessage), chat: new ObjectId(idChat) }, { projection: messageProj })
}

exports.getMessages = function (idChat, cursor) {
    let query = { chat: new ObjectId(idChat) } 
    if (cursor) {
        query = {
            $and: [
                { chat: new ObjectId(idChat) },
                { _id: { $lt: new ObjectId(cursor) } }
            ]
        }
    }

    return db.collection(db.collections.message).find(query, { projection: messageProj })
        .sort({ createdAt: -1 }).limit(db.configs.MESSAGES_PER_PAGE).toArray()
}

exports.deleteMessage = function (idChat, idMessage) {
    return db.collection(db.collections.message).deleteOne({ _id: new ObjectId(idMessage), chat: new ObjectId(idChat) })
}

exports.deleteMessages = function (idChat) {
    return db.collection(db.collections.message).deleteMany({ chat: new ObjectId(idChat) })
}

exports.countMessagesPages = function (idChat) {
    return new Promise((resolve, reject) => {
        db.collection(db.collections.message).countDocuments({ chat: new ObjectId(idChat) }).then((count) => {
            resolve(Math.ceil(count / db.configs.MESSAGES_PER_PAGE))
        }).catch(err => {
            reject(err)
        })
    })
}
