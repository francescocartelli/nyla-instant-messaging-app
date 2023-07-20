const passport = require('passport')
const JWTstrategy = require('passport-jwt').Strategy

require('dotenv').config()

const { verifyJwtPayload } = require('./auth')
const { cookieExtractor } = require.main.require('./components/utils')

passport.use('jwt', new JWTstrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.SECRET_OR_KEY
}, (payload, done) => {
    verifyJwtPayload(payload).then((user) => {
        done(null, user)
    }).catch(err => {
        done(err, false)
    })
}))