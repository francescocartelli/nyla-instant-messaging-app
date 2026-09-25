import { MongoClient, ObjectId } from 'mongodb'

const defaultOptions = { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 }

let _db

import { getLogger } from '../utility/logger.js'
const logger = getLogger()

export const connect = async (url, name, options = defaultOptions) => {
    try {
        const client = await MongoClient.connect(url, options)
        _db = client.db(name)

        logger.info("Connected to Mongodb!")
    } catch (err) {
        logger.debug(err)
        logger.error("Error in Mongodb connection!")
    }
}

export const configs = {
    CHATS_PER_PAGE: 10,
    MESSAGES_PER_PAGE: 10,
    USERS_PER_PAGE: 10
}

const collections = {
    chat: "chat",
    message: "message",
    user: "user"
}

export const getChatCollection = () => _db.collection(collections.chat)
export const getMessageCollection = () => _db.collection(collections.message)
export const getUserCollection = () => _db.collection(collections.user)

export const oid = id => ObjectId.createFromHexString(id.toString())
export const isOidValid = ObjectId.isValid

export const close = (...args) => _db.client.close(...args)
