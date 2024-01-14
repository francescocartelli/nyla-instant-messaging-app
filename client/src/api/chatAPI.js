async function getChatPersonal(page = 0, asc=false, isGroup=null, options = {}) {
    const response = await fetch(`/api/chats/personal?page=${page}&asc=${asc}&isGroup=${isGroup}`, options)

    const res = await response.json()
    if (response.ok) return res
    else throw new Error(res.message)
}

async function getChat(id, options) {
    const response = await fetch(`/api/chats/${id}`, options)

    if (response.ok) return response
    else throw new Error(response)
}

async function getChatUsers(id, options) {
    const response = await fetch(`/api/chats/${id}/users`, options)

    if (response.ok) return response
    else throw new Error(response)
}

async function getMessages(idChat, cursor, options) {
    const response = await fetch(`/api/chats/${idChat}/messages?cursor=${cursor}`, options)

    if (response.ok) return response
    else throw new Error(response)
}

async function createChat({ name, users, isGroup }) {
    const response = await fetch(`/api/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            users: users.map(u => u.id),
            isGroup: isGroup
        })
    })

    const res = await response.json()
    if (response.ok) return res
    else throw new Error(res.message)
}

async function updateChat(idChat, chat) {
    const response = await fetch(`/api/chats/${idChat}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: chat.name })
    })

    if (response.ok) return true
    else {
        const err = await response.json()
        throw new Error(err.message)
    }
}

async function addUserChat(idChat, idUser) {
    const response = await fetch(`/api/chats/${idChat}/users/${idUser}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) return true
    else {
        const err = await response.json()
        throw new Error(err.message)
    }
}

async function removeUserChat(idChat, idUser) {
    const response = await fetch(`/api/chats/${idChat}/users/${idUser}`, {
        method: 'DELETE'
    })

    if (response.ok) return true
    else {
        const err = await response.json()
        throw new Error(err.message)
    }
}

async function sendMessage(idChat, message) {
    const response = await fetch(`/api/chats/${idChat}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message.content })
    })

    const res = await response.json()
    if (response.ok) return res
    else throw new Error(res.message)
}

async function deleteMessage(idChat, idMessage) {
    const response = await fetch(`/api/chats/${idChat}/messages/${idMessage}`, {
        method: 'DELETE'
    })

    if (response.ok) return true
    else {
        const error = await response.json()
        throw new Error(error.message)
    }
}

async function deleteChat(idChat) {
    const response = await fetch(`/api/chats/${idChat}`, {
        method: 'DELETE'
    })

    if (response.ok) return true
    else {
        const error = await response.json()
        return new Error(error.message)
    }
}

const chatAPI = { getChatPersonal, getChat, getChatUsers, getMessages, sendMessage, createChat, updateChat, addUserChat, removeUserChat, deleteMessage, deleteChat }

export default chatAPI