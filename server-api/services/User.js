const { ObjectId } = require('mongodb')

const { userProjection } = require.main.require('./components/User')
const { getUserCollection, configs: dbConfigs } = require.main.require('./components/Db')

const userCollection = getUserCollection()

const searchQueries = {
    "exact": (username) => { return { username: { $regex: `^${username}$`, $options: 'i' } } },
    "contains": (username) => { return { username: { $regex: username, $options: 'i' } } }
}

const formatTypes = Object.keys(searchQueries).map(i => `"${i}"`).join(", ")

exports.getUsers = (username = "", searchType = "contains") => {
    const query = searchQueries[searchType]
    if (!query) throw new TypeError(`"${searchType}" is not a valid search type.\nAvailable ones are: ${formatTypes}`)

    return username === "" ?
        Promise.resolve([]) : userCollection
            .find(query(username), { projection: userProjection })
            .limit(dbConfigs.USERS_PER_PAGE).toArray()
}

exports.getUser = (user = {}) => {
    let { id, ...u } = user
    if (id) u._id = new ObjectId(id)

    return userCollection.findOne(u, { projection: userProjection })
}

exports.getUserId = (id) => {
    return userCollection.findOne({ _id: new ObjectId(id) }, { projection: { _id: 1 } })
}

exports.getHash = (user = {}) => {
    let { id, ...u } = user
    if (id) u._id = new ObjectId(id)

    return userCollection.findOne(u, { projection: { _id: 0, id: '$_id', hash: 1 } })
}

exports.createUser = (user) => {
    return userCollection.insertOne(user)
}

exports.updateUser = (id, user) => {
    return userCollection.updateOne({ _id: new ObjectId(id) }, { $set: user })
}

/* semicit: user cannot be deleted, they simply result missing */
exports.deleteUser = (id) => {
    return userCollection.deleteOne({ _id: new ObjectId(id) })
}

exports.getFullUsers = (ids) => {
    return userCollection.find({ _id: { $in: ids.map(i => new ObjectId(i)) } }, { projection: userProjection }).toArray()
}