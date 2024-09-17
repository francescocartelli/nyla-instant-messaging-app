import { chatEndpoint, chatMessageEndpoint, chatMessagesEndpoint, chatsEndpoint, chatUserEndpoint, chatUsersEndpoint, personalChatsEndpoint } from "./endpoints"
import { deleteConfig, postConfigJSON, putConfigJSON, safeFetch } from "./utils"

const getChatPersonal = (page = 0, asc = false, isGroup = null, options = {}) => safeFetch(personalChatsEndpoint(page, asc, isGroup), options)
const getChat = (id, options) => safeFetch(chatEndpoint(id), options)
const createChat = ({ name, users, isGroup }) => safeFetch(chatsEndpoint(), postConfigJSON({ name, users: users.map(u => u.id), isGroup }))
const updateChat = (idChat, { name }) => safeFetch(chatEndpoint(idChat), putConfigJSON({ name }))
const deleteChat = (idChat) => safeFetch(chatEndpoint(idChat), deleteConfig())

const getChatUsers = (id, options) => safeFetch(chatUsersEndpoint(id), options)
const addUserChat = (idChat, idUser) => safeFetch(chatUserEndpoint(idChat, idUser), putConfigJSON())
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
    removeUserChat,
    getMessages,
    sendMessage,
    deleteMessage
}

export default chatAPI