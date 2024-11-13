exports.getChatNavigation = ({ asc, isGroup }) => {
    const endpoint = "/api/chats/personal"
    const params = `&asc=${asc}&isGroup=${isGroup}`

    return (page) => `${endpoint}?page=${page}${params}`
}

exports.getMessageNavigation = (idChat, next) => `/api/chats/${idChat}/messages?cursor=${next}`