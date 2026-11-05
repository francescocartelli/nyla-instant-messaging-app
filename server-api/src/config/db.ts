import { Db, MongoClient, ObjectId } from 'mongodb'

const defaultOptions = { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 }

let _db: Db
let _client: MongoClient

import { ChatDocument } from '../model/Chat.ts'
import { MessageDocument } from '../model/Message.ts'
import { UserDocument } from '../model/User.ts'

import { getLogger } from '../utility/logger.ts'
const logger = getLogger()

export const connect = async (url: string, name: string, options = defaultOptions) => {
    try {
        _client = await MongoClient.connect(url, options)
        _db = _client.db(name)

        logger?.info("Connected to Mongodb!")
    } catch (err) {
        logger?.debug(err)
        logger?.error("Error in Mongodb connection!")
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

export const getChatCollection = () => _db.collection<ChatDocument>(collections.chat)
export const getMessageCollection = () => _db.collection<MessageDocument>(collections.message)
export const getUserCollection = () => _db.collection<UserDocument>(collections.user)

export const oid = (id: string | ObjectId) => ObjectId.createFromHexString(id.toString())
export const isOidValid = ObjectId.isValid

export const close = (...args: Parameters<MongoClient['close']>) => _client.close(...args)
