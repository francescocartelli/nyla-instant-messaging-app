const { extractResponseCookie } = require("../utilities/CookieJWT")
const { invokeFetch } = require("../utilities/network")

const signInBot = ({ username, password }) => invokeFetch(`${process.env.API_SERVER_URL}/api/authenticate/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIdentifier: username, password })
})

const signUpBot = async ({ username, password, email }) => invokeFetch(`${process.env.API_SERVER_URL}/api/authenticate/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email })
})

const signBot = async ({ username, password, email }) => {
    try {
        // try signin
        let res = await signInBot({ username, password })

        // if not ok try signup
        if (!res.ok) res = await signUpBot({ username, password, email })

        const user = await res.json()
        const jwt = extractResponseCookie(res)

        return { user, jwt }
    } catch (err) {
        logger.error(err)
        return null
    }
}

exports.signBot = signBot