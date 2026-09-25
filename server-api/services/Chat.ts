import { configs as dbConfigs, getChatCollection, oid } from '../config/Db.ts'

import { Chat, ChatUpdate, DirectChatMember, groupChatMember, GroupChatMember, GroupChatMemberInput, newChat, NewChatInput, PublicChat, PublicChatFull, userInChatPrefix } from '../model/Chat.ts'
import { PublicUser, User } from "../model/User.ts"

import { evaluateModifiedResults } from "../utility/Evaluate.ts"

const chatProj = {
    _id: 0,
    id: '$_id',
    name: 1,
    users: { $concat: ["/api/chats/", { $toString: "$_id" }, "/users"] },
    nUsers: { $size: "$users" },
    messages: { $concat: ["/api/chats/", { $toString: "$_id" }, "/messages"] },
    isGroup: 1,
    createdAt: 1,
    updatedAt: 1
}

interface PersonalChatsQueryOptions {
    isGroup?: boolean | null
}

const personalChatsQuery = (idUser: string, { isGroup }: PersonalChatsQueryOptions) => ({
    users: { $elemMatch: { id: oid(idUser) } },
    ...(isGroup !== null ? { isGroup } : {})
})

const createChat = (chat: NewChatInput) => {
    return getChatCollection().insertOne(newChat(chat))
}

const getChat = (idChat: string, project: boolean = true) => {
    return getChatCollection().findOne<PublicChat | Chat>(
        { _id: oid(idChat) },
        project ? { projection: chatProj } : {})
}

interface CountChatsPagesOptions {
    isGroup?: boolean | null | undefined
    pageSize?: number
}

interface GetChatsPersonalOptions extends CountChatsPagesOptions {
    page?: number
    asc?: boolean
}

const getChatsPersonal = (idUser: string, { page = 1, asc = false, isGroup = null, pageSize = dbConfigs.CHATS_PER_PAGE }: GetChatsPersonalOptions) => {
    return getChatCollection()
        .find<PublicChatFull>(personalChatsQuery(idUser, { isGroup }), { projection: { ...chatProj, usersFull: '$users' } })
        .sort({ updatedAt: asc ? 1 : -1 }).limit(pageSize)
        .skip(pageSize * (page - 1)).toArray()
}

const countChatsPages = async (idUser: string, { isGroup = null, pageSize = dbConfigs.CHATS_PER_PAGE }: CountChatsPagesOptions): Promise<number> => {
    const count = await getChatCollection().countDocuments(personalChatsQuery(idUser, { isGroup }))

    return Math.ceil(count / pageSize)
}

const getChatsAndCountPersonal = async (id: string, params: GetChatsPersonalOptions) => {
    let [chats, nPages] = await Promise.all([
        getChatsPersonal(id, params),
        countChatsPages(id, params)
    ])

    return { chats, nPages }
}

const checkChatExistence = (users: Array<string>) => {
    if (users.length !== 2) throw new Error("Users must be two in a direct messages chat")
    return getChatCollection().findOne<Chat>({
        isGroup: false,
        $and: [
            { 'users.id': { $in: [oid(users[0])] } },
            { 'users.id': { $in: [oid(users[1])] } }
        ]
    }, { projection: { _id: 0, id: '$_id' } })
}

const updateChat = (idChat: string, chat: Partial<ChatUpdate>) => {
    return getChatCollection().updateOne(
        { _id: oid(idChat) },
        { $set: chat }
    )
}

const updateChatLog = (idChat: string) => {
    return getChatCollection().updateOne(
        { _id: oid(idChat) },
        { $set: { updatedAt: new Date() } }
    )
}

const deleteChat = (idChat: string) => {
    return getChatCollection().deleteOne({ _id: oid(idChat) })
}

const getChatUsers = async (idChat: string) => {
    const chat = await getChatCollection().findOne<Chat>({ _id: oid(idChat) })
    return chat && chat.users
}

const getChatUsersMap = async (idChat: string): Promise<Record<string, Partial<DirectChatMember> | Partial<GroupChatMember>> | null> => {
    const chatUsers = await getChatUsers(idChat)
    return chatUsers && Object.fromEntries(chatUsers.map(({ id, ...u }) => [id.toString(), u]))
}

const addUser = (idChat: string, user: GroupChatMemberInput) => {
    return getChatCollection().updateOne(
        { _id: oid(idChat) },
        { $push: { users: groupChatMember(user) } }
    )
}

const updateUser = (idChat: string, idUser: string, user: Partial<GroupChatMemberInput>) => {
    return getChatCollection().updateOne(
        { _id: oid(idChat) },
        { $set: userInChatPrefix(user) },
        { arrayFilters: [{ 'u.id': oid(idUser) }] }
    )
}

const removeUser = (idChat: string, idUser: string) => {
    return getChatCollection().updateOne(
        { _id: oid(idChat) },
        { $pull: { users: { id: oid(idUser) } } }
    )
}


type LookupUser = (user: Partial<User>) => Promise<PublicUser | null>

const lookupChatname = (lookupUserUsername: LookupUser, idUser: string) => async ({ name, usersFull, ...c }: PublicChatFull) => {
    if (name) return { ...c, name }

    const userIdForUsername = usersFull!.find(u => u.id.toString() !== idUser.toString())
    if (!userIdForUsername) return { ...c, name: '' }

    const user = await lookupUserUsername({ id: userIdForUsername.id })
    return { ...c, name: user?.username ?? '' }
}

const lookupChatnames = (chats: Array<PublicChatFull>, id: string, lookupUserUsername: LookupUser): Promise<Array<PublicChatFull>> => {
    const lookup = lookupChatname(lookupUserUsername, id)

    return Promise.all(chats.map(lookup))
}

const deleteUserChats = async (idUser: string) => {
    const chats = await getChatsPersonal(idUser, { pageSize: Infinity })

    const results = await Promise.all(chats.map(({ id: idChat, nUsers, isGroup }) => (!isGroup || nUsers < 2) ?
        deleteChat(idChat.toString()) :
        removeUser(idChat.toString(), idUser)
    ))

    return evaluateModifiedResults(results)
}

export default {
    createChat,
    getChat,
    getChatsAndCountPersonal,
    checkChatExistence,
    updateChat,
    updateChatLog,
    deleteChat,
    getChatUsers,
    getChatUsersMap,
    addUser,
    updateUser,
    removeUser,
    lookupChatnames,
    deleteUserChats
}