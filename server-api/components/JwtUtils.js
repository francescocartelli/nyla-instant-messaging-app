const jwt = require('jsonwebtoken')

require('dotenv').config()

const { getDate, day } = require.main.require('./components/Utils')

exports.generateToken = ({ id }) => {
    return jwt.sign({
        sub: id,
        iat: getDate(),
        exp: getDate() + day()
    }, process.env.SECRET_OR_KEY)
}

exports.getCookieParams = (token) => {
    return ['jwt', token, { httpOnly: true, secure: false }]
}