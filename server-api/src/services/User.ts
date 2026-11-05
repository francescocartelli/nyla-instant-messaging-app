import { ObjectId, type Filter } from 'mongodb'

import { configs as dbConfigs, getUserCollection, isOidValid, oid } from '../config/db.ts'

import { DirectChatMember, GroupChatMember } from '../model/Chat.ts'
import { newUser, NewUser, PublicUser, UpdateUser, User, UserDocument, UserHash } from '../model/User.ts'

const userProjection = {
    _id: 0,
    id: '$_id',
    username: 1,
    bio: 1,
    confirmed: 1
} as const

export type SearchType = 'exact' | 'contains'

type SearchQuery = (username: string) => Filter<UserDocument>

const searchQueries: Record<SearchType, SearchQuery> = {
    exact: (username) => ({ username: { $regex: `^${username}$`, $options: 'i' } }),
    contains: (username) => ({ username: { $regex: username, $options: 'i' } })
}

const formatTypes = Object.keys(searchQueries).map(i => `"${i}"`).join(', ')

const getUserId = (id: string | ObjectId) => {
    return getUserCollection().findOne(
        { _id: oid(id) },
        { projection: { _id: 1 } })
}

const getUsers = (username: string = '', searchType: SearchType = 'contains') => {
    const query = searchQueries[searchType]
    if (!query) throw new TypeError(`"${searchType}" is not a valid search type.\nAvailable ones are: ${formatTypes}`)

    return username === '' ?
        Promise.resolve([]) :
        getUserCollection()
            .find<PublicUser>(query(username), { projection: userProjection })
            .limit(dbConfigs.USERS_PER_PAGE)
            .toArray()
}

const getUser = ({ id, ...user }: Partial<User>) => {
    return getUserCollection()
        .findOne<PublicUser>({
            ...user,
            ...(id && { _id: oid(id) })
        }, { projection: userProjection })
}

const getUserHash = (userIdentifier: string) => {
    return getUserCollection()
        .findOne<UserHash>({
            $or: [
                { username: userIdentifier },
                { email: userIdentifier }
            ]
        }, { projection: { _id: 0, id: '$_id', hash: 1 } })
}

const createUser = (user: NewUser) => {
    return getUserCollection().insertOne(newUser(user))
}

const updateUser = (id: string | ObjectId, user: Partial<UpdateUser>) => {
    return getUserCollection()
        .updateOne({ _id: oid(id) }, { $set: user })
}

/* semicit: user cannot be deleted, they simply result missing */
const deleteUser = (id: string | ObjectId) => {
    return getUserCollection()
        .deleteOne({ _id: oid(id) })
}

const getFullUsers = (ids: Array<string | ObjectId>) => {
    return getUserCollection()
        .find<PublicUser>({ _id: { $in: ids.map(id => oid(id.toString())) } }, { projection: userProjection })
        .toArray()
}

const getChatUsers = async (chatUsersMap: Record<string, Partial<DirectChatMember> | Partial<GroupChatMember>>) => {
    const fullUsers = await getFullUsers(Object.keys(chatUsersMap))

    return fullUsers.map(({ id, ...user }) => ({
        ...user,
        ...chatUsersMap[id.toString()],
        id
    }))
}

const validateUsersIds = (users: Array<string | ObjectId>): boolean => {
    return users
        .map(userId => isOidValid(userId))
        .every(Boolean)
}

const validateUsersExistence = async (users: Array<string | ObjectId>): Promise<boolean> => {
    const existingIds = await Promise.all(
        users.map(userId => getUserId(userId))
    )

    return existingIds.every(user => user !== null)
}

export default {
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