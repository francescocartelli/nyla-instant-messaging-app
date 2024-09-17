const baseUrl = '/api'

const RESOURCES = {
    CHATS: 'chats',
    MESSAGES: 'messages',
    USERS: 'users',
    AUTH: 'authenticate'
}

const endpoint = url => `${baseUrl}/${url}`

const authEndpoint = () => endpoint(RESOURCES.AUTH)
const signinEndpoint = () => `${authEndpoint()}/signin`
const signupEndpoint = () => `${authEndpoint()}/signup`
const logoutEndpoint = () => `${authEndpoint()}/logout`

const usersEndpoint = () => endpoint(RESOURCES.USERS)
const userEndpoint = id => `${usersEndpoint()}/${id}`
const currentUserEndpoint = () => `${usersEndpoint()}/current`
const searchUsersEndpoint = (username, searchType) => `${usersEndpoint()}?username=${encodeURIComponent(username)}&searchType=${searchType}`

const chatsEndpoint = () => endpoint(RESOURCES.CHATS)
const personalChatsEndpoint = (page, asc, isGroup) => `${chatsEndpoint()}/personal?page=${page}&asc=${asc}&isGroup=${isGroup}`
const chatEndpoint = id => `${chatsEndpoint()}/${id}`
const chatUsersEndpoint = id => `${chatEndpoint(id)}/${RESOURCES.USERS}`
const chatUserEndpoint = (idChat, idUser) => `${chatUsersEndpoint(idChat)}/${idUser}`
const chatMessagesEndpoint = (id, cursor) => `${chatEndpoint(id)}/${RESOURCES.MESSAGES}/?cursor=${cursor}`
const chatMessageEndpoint = (idChat, idMessage) => `${chatEndpoint(idChat)}/${RESOURCES.MESSAGES}/${idMessage}`

export {
    authEndpoint,
    signinEndpoint,
    signupEndpoint,
    logoutEndpoint,
    usersEndpoint,
    userEndpoint,
    currentUserEndpoint,
    searchUsersEndpoint,
    chatsEndpoint,
    personalChatsEndpoint,
    chatEndpoint,
    chatUsersEndpoint,
    chatUserEndpoint,
    chatMessagesEndpoint,
    chatMessageEndpoint
}

