import { Strategy as JWTstrategy } from "passport-jwt"

import accountService from "../../services/Account.js"

import usersServices from "../../services/User.js"

const verify = async payload => {
    const user = await usersServices.getUser({ id: payload.sub })

    if (user && accountService.verifyPayload(payload)) return user
    else return false
}

export const useJWTtrategy = configs => new JWTstrategy({
    jwtFromRequest: accountService.cookieExtractor,
    ...configs
}, (payload, done) => verify(payload)
    .then(user => done(null, user))
    .catch(err => done(err, false))
)