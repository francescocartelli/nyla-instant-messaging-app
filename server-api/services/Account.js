const bcrypt = require('bcrypt')

const jwtCode = 'jwt'
const saltOrRounds = 10

const getDate = () => Math.floor(Date.now() / 1000)
const day = (n = 1) => n * (60 * 60 * 24)

exports.getHash = password => bcrypt.hash(password, saltOrRounds)
exports.compare = bcrypt.compare

exports.tokenPayload = sub => ({
    sub,
    iat: getDate(),
    exp: getDate() + day()
})

exports.cookieExtractor = req => (req && req.cookies) ? req.cookies[jwtCode] : null
exports.verifyPayload = ({ exp }) => getDate() < exp