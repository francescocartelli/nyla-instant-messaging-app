const { jwtTCookieHeader } = require("../utilities/CookieJWT")
const { invokeFetch } = require("../utilities/network")

const sendMessage = (idChat, jwt, text) => invokeFetch(`${process.env.API_SERVER_URL}/api/chats/${idChat}/messages`, {
    method: 'POST',
    headers: {
        'Cookie': `jwt=${jwt}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: [{ type: 'paragraph', children: [{ text }] }] })
})

const getMessages = (idChat, jwt) => invokeFetch(`${process.env.API_SERVER_URL}/api/chats/${idChat}/messages`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        ...jwtTCookieHeader(jwt)
    }
}).then(res => res.json())

exports.sendMessage = sendMessage
exports.getMessages = getMessages