const { invokeFetch } = require("../utilities/network")

const sendMessage = (idChat, jwt, text) => invokeFetch(`${process.env.API_SERVER_URL}/api/chats/${idChat}/messages`, {
    method: 'POST',
    headers: {
        'Cookie': `jwt=${jwt}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: [{ type: 'paragraph', children: [{ text }] }] })
})

exports.sendMessage = sendMessage