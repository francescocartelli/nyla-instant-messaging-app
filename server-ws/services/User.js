const cookieParser = require('cookie-parser')

const cookieParserMiddleware = cookieParser()

const extractCookieJWT = req => req.cookies?.jwt

const extractJWT = req => new Promise((resolve, reject) => cookieParserMiddleware(req, {}, () => {
    try {
        resolve(extractCookieJWT(req))
    } catch (err) {
        reject(err)
    }
}))

const createGetCurrentUser = retrieveUser => async (req) => {
    const jwt = await extractJWT(req)
    if (!jwt) throw new Error("Missing JWT cookie")

    return retrieveUser(jwt)
}


module.exports = createGetCurrentUser