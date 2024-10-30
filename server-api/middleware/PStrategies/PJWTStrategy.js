const JWTstrategy = require("passport-jwt").Strategy

require("dotenv").config()

const { cookieExtractor } = require.main.require("./components/JwtUtils")
const { getDate } = require.main.require("./components/Utils")

const usersServices = require.main.require("./services/User")

const verify = async payload => {
    const user = await usersServices.getUser({ id: payload.sub })

    if (user && getDate() < payload.exp) return user
    else return false
}

exports.useJWTtrategy = new JWTstrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.SECRET_OR_KEY
}, (payload, done) => verify(payload)
    .then(user => done(null, user))
    .catch(err => done(err, false))
)