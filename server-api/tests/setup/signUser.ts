import type { Express } from 'express'
import request from 'supertest'

import { PublicUser } from '../../model/User.ts'
import { extractResponseCookie } from "./utils.ts"

interface SignUserProps {
    username: string
    email: string
    password: string
}

export interface SignUser extends PublicUser {
    jwt: string
}

const createSignUser = (app: Express) => async ({ username, email, password }: SignUserProps): Promise<SignUser> => {
    const signupRes = await request(app)
        .post('/api/authenticate/signup')
        .send({ username, email, password })

    const res = await request(app)
        .post('/api/authenticate/signin')
        .send({ userIdentifier: username, password })

    const jwt = extractResponseCookie(res)

    return { ...res.body, jwt }
}

export default createSignUser