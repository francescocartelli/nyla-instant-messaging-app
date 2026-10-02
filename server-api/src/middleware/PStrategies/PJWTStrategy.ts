import type { JwtPayload } from "jsonwebtoken"
import { Strategy as JWTstrategy, StrategyOptionsWithoutRequest, VerifiedCallback } from "passport-jwt"

import accountService from "../../services/Account.ts"
import usersServices from "../../services/User.ts"

const verify = async (payload: JwtPayload) => {
    const user = await usersServices.getUser({ id: payload.sub as string })

    if (user && accountService.verifyPayload(payload)) return user
    else return false
}

export const useJWTtrategy = (configs: StrategyOptionsWithoutRequest) => new JWTstrategy({
    ...configs,
    jwtFromRequest: accountService.cookieExtractor
}, (payload: any, done: VerifiedCallback) => verify(payload)
    .then(user => done(null, user!))
    .catch(err => done(err, false))
)