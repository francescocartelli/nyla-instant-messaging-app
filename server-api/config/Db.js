const { MongoClient, ObjectId } = require('mongodb')

const defaultOptions = { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 }

let _db

const { getLogger } = require('../utility/logger')
const logger = getLogger()

exports.connect = async (url, name, options = defaultOptions) => {
    try {
        const client = await MongoClient.connect(url, options)
        _db = client.db(name)

        logger.info("Connected to Mongodb!")
    } catch (err) {
        logger.debug(err)
        logger.error("Error in Mongodb connection!")
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

exports.close = (...args) => _db.client.close(...args)
