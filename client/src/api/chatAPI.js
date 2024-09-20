import { chatEndpoint, chatMessageEndpoint, chatMessagesEndpoint, chatsEndpoint, chatUserEndpoint, chatUsersEndpoint, personalChatsEndpoint } from "./endpoints"
import { deleteConfig, postConfigJSON, putConfigJSON, safeFetch } from "./utils"

const userInChatMapping = ({ id }, owner) => ({ id, isAdmin: id === owner.id.toString() })
const userInDirectChatMapping = ({ id }) => ({ id })

const mapChatUsers = (users, owner) => users.map(u => userInChatMapping(u, owner))
const mapDirectChatUsers = users => users.map(userInDirectChatMapping)

const updateUserChatMapping = ({ isAdmin }) => ({ isAdmin })

const getChatPersonal = (page = 0, asc = false, isGroup = null, options = {}) => safeFetch(personalChatsEndpoint(page, asc, isGroup), options)
const getChat = (id, options) => safeFetch(chatEndpoint(id), options)
const createChat = ({ name, users, isGroup }, owner) => safeFetch(chatsEndpoint(), postConfigJSON({
    name,
    users: isGroup ? mapChatUsers(users, owner) : mapDirectChatUsers(users),
    isGroup
}))
const updateChat = (idChat, { name }) => safeFetch(chatEndpoint(idChat), putConfigJSON({ name }))
const deleteChat = (idChat) => safeFetch(chatEndpoint(idChat), deleteConfig())

const getChatUsers = (id, options) => safeFetch(chatUsersEndpoint(id), options)
const addUserChat = (idChat, idUser) => safeFetch(chatUserEndpoint(idChat, idUser), postConfigJSON())
const updateUserChat = (idChat, idUser, user) => safeFetch(chatUserEndpoint(idChat, idUser), putConfigJSON(updateUserChatMapping(user)))
const removeUserChat = (idChat, idUser) => safeFetch(chatUserEndpoint(idChat, idUser), deleteConfig())

const getMessages = (idChat, cursor, options) => safeFetch(chatMessagesEndpoint(idChat, cursor), options)
const sendMessage = (idChat, { content }) => safeFetch(chatMessagesEndpoint(idChat), postConfigJSON({ content }))
const deleteMessage = (idChat, idMessage) => safeFetch(chatMessageEndpoint(idChat, idMessage), deleteConfig())

const chatAPI = {
    getChatPersonal,
    getChat,
    createChat,
    updateChat,
    deleteChat,
    getChatUsers,
    addUserChat,
    updateUserChat,
    removeUserChat,
    getMessages,
    sendMessage,
    deleteMessage
}

export default chatAPI