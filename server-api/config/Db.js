const { MongoClient, ObjectId } = require('mongodb')

const defaultOptions = { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 }

let _db

exports.connect = async (url, name, options = defaultOptions) => {
    try {
        const client = await MongoClient.connect(url, options)
        _db = client.db(name)

        console.log("Connected to Mongodb!")
    } catch (err) {
        console.log(err)
        console.log("Error in Mongodb connection!")
    }
}

exports.configs = {
    CHATS_PER_PAGE: 10,
    MESSAGES_PER_PAGE: 10,
    USERS_PER_PAGE: 10
}

const collections = {
    chat: "chat",
    message: "message",
    user: "user"
}

exports.getChatCollection = () => _db.collection(collections.chat)
exports.getMessageCollection = () => _db.collection(collections.message)
exports.getUserCollection = () => _db.collection(collections.user)

exports.oid = id => ObjectId.createFromHexString(id.toString())
exports.isOidValid = ObjectId.isValid
