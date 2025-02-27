const { oid, isOidValid, getUserCollection, configs: dbConfigs } = require('../config/Db')

const { newUser } = require('../model/User')

const userCollection = getUserCollection()

const userProjection = {
    _id: 0,
    id: '$_id',
    username: 1,
    bio: 1,
    confirmed: 1
}

const searchQueries = {
    exact: (username) => ({ username: { $regex: `^${username}$`, $options: 'i' } }),
    contains: (username) => ({ username: { $regex: username, $options: 'i' } })
}

const formatTypes = Object.keys(searchQueries).map(i => `"${i}"`).join(", ")

const getUserId = (id) => {
    return userCollection.findOne({ _id: oid(id) }, { projection: { _id: 1 } })
}

const getUsers = (username = "", searchType = "contains") => {
    const query = searchQueries[searchType]
    if (!query) throw new TypeError(`"${searchType}" is not a valid search type.\nAvailable ones are: ${formatTypes}`)

    return username === "" ?
        Promise.resolve([]) : userCollection
            .find(query(username), { projection: userProjection })
            .limit(dbConfigs.USERS_PER_PAGE).toArray()
}

const getUser = ({ id, ...user }) => {
    return userCollection.findOne({
        ...user,
        ...(id && { _id: oid(id) })
    }, { projection: userProjection })
}

const getUserHash = (userIdentifier) => {
    return userCollection.findOne({
        $or: [
            { username: userIdentifier },
            { email: userIdentifier }
        ]
    }, { projection: { _id: 0, id: '$_id', hash: 1 } })
}

const createUser = (user) => {
    return userCollection.insertOne(newUser(user))
}

const updateUser = (id, user) => {
    return userCollection.updateOne({ _id: oid(id) }, { $set: user })
}

/* semicit: user cannot be deleted, they simply result missing */
const deleteUser = (id) => {
    return userCollection.deleteOne({ _id: oid(id) })
}

const getFullUsers = (ids) => {
    return userCollection.find({ _id: { $in: ids.map(i => oid(i.toString())) } }, { projection: userProjection }).toArray()
}

const getChatUsers = async (chatUsersMap) => {
    const fullUsers = await getFullUsers(Object.keys(chatUsersMap))
    return fullUsers && fullUsers.map(({ id, ...u }) => ({ id, ...u, ...chatUsersMap[id] }))
}

const validateUsersIds = (users) => {
    const validIds = users.map((userId) => isOidValid(userId))
    return validIds.every(Boolean)
}

const validateUsersExistence = async (users) => {
    const existingIds = await Promise.all(users.map(userId => getUserId(userId)))
    return existingIds.every(i => i !== null)
}

module.exports = {
    getUsers,
    getUser,
    getUserId,
    getUserHash,
    createUser,
    updateUser,
    deleteUser,
    getFullUsers,
    getChatUsers,
    validateUsersIds,
    validateUsersExistence
}