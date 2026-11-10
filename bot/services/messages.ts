import { jwtTCookieHeader } from '../utilities/cookieJWT.ts'
import { invokeFetch } from '../utilities/network.ts'

export const sendMessage = (idChat, jwt, text) => invokeFetch(`${process.env.API_SERVER_URL}/api/chats/${idChat}/messages`, {
    method: 'POST',
    headers: {
        'Cookie': `jwt=${jwt}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: [{ type: 'paragraph', children: [{ text }] }] })
})

export const getMessages = (idChat, jwt) => invokeFetch(`${process.env.API_SERVER_URL}/api/chats/${idChat}/messages`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        ...jwtTCookieHeader(jwt)
    }
}).then(res => res.json())