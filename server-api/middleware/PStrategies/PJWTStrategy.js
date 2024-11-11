const JWTstrategy = require("passport-jwt").Strategy

const { cookieExtractor, verifyPayload } = require("../../services/Account")
const usersServices = require("../../services/User")

const verify = async payload => {
    const user = await usersServices.getUser({ id: payload.sub })

    if (user && verifyPayload(payload)) return user
    else return false
}

exports.useJWTtrategy = configs => new JWTstrategy({
    jwtFromRequest: cookieExtractor,
    ...configs
}, (payload, done) => verify(payload)
    .then(user => done(null, user))
    .catch(err => done(err, false))
)