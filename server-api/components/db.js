const { MongoClient } = require('mongodb')

require('dotenv').config()

const url = process.env.DATABASE_URL
const options = { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 }

let _db

module.exports = {
    connect: async (callback) => {
        try {
            const client = await MongoClient.connect(url, options)
            _db = client.db(process.env.DATABASE_NAME)

            console.log("Connected to Mongodb!")
        } catch (err) {
            console.log(err)
            console.log("Error in Mongodb connection!")
        }

        _db.collections = {
            chat: 'chat',
            message: 'message',
            user: 'user'
        }

        _db.configs = {
            CHATS_PER_PAGE: 10,
            MESSAGES_PER_PAGE: 10,
            USERS_PER_PAGE: 10
        }

        callback()
    },
    get: function () {
        return _db
    }
}