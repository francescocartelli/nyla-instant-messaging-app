const cookieParser = require('cookie-parser')

const cookieParserMiddleware = cookieParser()

const extractJWT = req => req.cookies?.jwt

const createUserStore = retrieveUser => req => new Promise((resolve, reject) => {
    cookieParserMiddleware(req, {}, async () => {
        const jwt = extractJWT(req)
        if (!jwt) reject({ status: 401, message: "Missing JWT cookie" })

        try {
            const { data } = await retrieveUser(jwt)
            resolve(data)
        } catch (err) {
            reject({ status: err.response.status, message: err.response.statusText })
        }
    })
})


module.exports = createUserStore