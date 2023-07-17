const { ObjectId } = require('mongodb')

const mongo = require.main.require('./components/db')

const db = mongo.get()

const userProjection = { _id: 0, id: '$_id', username: 1, email: 1, confirmed: 1 }

exports.getUsers = (username) => {
    let query = { username: { $regex: username, $options: 'i' } }
    return db.collection(db.collections.user).find(query, { projection: userProjection }).limit(db.configs.USERS_PER_PAGE).toArray()
}

exports.getUser = (user = {}) => {
    let { id, ...u } = user
    if (id) u._id = new ObjectId(id)

    return db.collection(db.collections.user).findOne(u, { projection: userProjection })
}

exports.getUserId = (id) => {
    return db.collection(db.collections.user).findOne({ _id: new ObjectId(id) }, { projection: { _id: 1 } })
}

exports.getHash = (user = {}) => {
    let { id, ...u } = user
    if (id) u._id = new ObjectId(id)

    return db.collection(db.collections.user).findOne(u, { projection: { _id: 0, id: '$_id', hash: 1 } })
}

exports.createUser = (user) => {
    return db.collection(db.collections.user).insertOne(user)
}

exports.updateUser = (id, user) => {
    return db.collection(db.collections.user).updateOne({ _id: new ObjectId(id) }, { $set: user })
}

/* semicit: user cannot be deleted, they simply result missing */
exports.deleteUser = (id) => {
    return db.collection(db.collections.user).deleteOne({ _id: new ObjectId(id) })
}

exports.getFullUsers = (ids) => {
    return db.collection(db.collections.user).find({ _id: { $in: ids.map(i => new ObjectId(i)) } }, { projection: userProjection }).toArray()
}