async function getChatPersonal(page=0, options={}) {
    const response = await fetch(`/api/chats/personal?page=${page}`, options)

    const res = await response.json()
    if (response.ok) return res
    else throw new Error(res.message)
}

async function getChat(id) {
    const response = await fetch(`/api/chats/${id}`)

    const res = await response.json()
    if (response.ok) return res
    else throw new Error(res.message)
}

async function getChatUsers(id) {
    const response = await fetch(`/api/chats/${id}/users`)

    const res = await response.json()
    if (response.ok) return res
    else throw new Error(res.message)
}

const chatAPI = { getChatPersonal, getChat, getChatUsers }

export default chatAPI