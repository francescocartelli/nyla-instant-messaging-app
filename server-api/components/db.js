const { MongoClient } = require('mongodb')

require('dotenv').config()

const uri = process.env.DATABASE_URI
const options = { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 }

let _db

module.exports = {
    connect: async (callback) => {
        try {
            const client = await MongoClient.connect(uri, options)
            _db = client.db(process.env.DATABASE_NAME)

            console.log("Connected to Mongodb!")
        } catch (err) {
            console.log(err)
            console.log("Error in Mongodb connection!")
        }

        _db.collections = {
            user: 'user',
            chat: 'chat'
        }

        _db.configs = {
            USERS_PER_PAGE:10
        }

        callback()
    },
    get: function () {
        return _db
    }
}