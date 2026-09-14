import request from 'supertest'

import { extractResponseCookie } from "./utils.js"

const createSignUser = app => async ({ username, email, password }) => {
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