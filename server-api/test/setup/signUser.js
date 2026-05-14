const request = require('supertest')

const { extractResponseCookie } = require("./utils")

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

module.exports = createSignUser