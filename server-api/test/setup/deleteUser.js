const request = require('supertest')
const { jwtCookie } = require('./utils')

const createDeleteUser = app => ({ jwt }) => request(app)
    .delete('/api/users/current')
    .set('Cookie', jwtCookie(jwt))

module.exports = createDeleteUser