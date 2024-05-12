const axios = require('axios')
const cookieParser = require('cookie-parser')

require('dotenv').config()

const { getCookieJWT } = require('../components/CookieJWT')

const cookieParserMiddleware = cookieParser()

const userCurrentURI = `http://${process.env.API_SERVER_URL}/api/users/current`

exports.getCurrentUser = (req) => {
    return new Promise((resolve, reject) => {
        cookieParserMiddleware(req, {}, async () => {
            const jwt = req.cookies?.jwt
            if (!jwt) reject({ status: 401, message: "Missing JWT cookie" })

            try {
                const { data } = await axios.get(userCurrentURI, getCookieJWT(jwt))
                resolve(data)
            } catch (err) {
                reject({
                    status: err.response.status,
                    message: err.response.statusText
                })
            }
        })
    })
}