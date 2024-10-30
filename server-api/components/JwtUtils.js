const jwt = require('jsonwebtoken')

require('dotenv').config()

const { getDate, day } = require.main.require('./components/Utils')

const cookieOptions = {
    httpOnly: true,
    secure: false, // when using https set it to true,
    sameSite: 'strict'
}

const jwtCode = 'jwt'

const generateToken = ({ id }) => jwt.sign({
    sub: id,
    iat: getDate(),
    exp: getDate() + day()
}, process.env.SECRET_OR_KEY)

const getCookieParams = token => [jwtCode, token, cookieOptions]

exports.generateCookieToken = user => getCookieParams(generateToken(user))

exports.cookieExtractor = req => (req && req.cookies) ? req.cookies[jwtCode] : null