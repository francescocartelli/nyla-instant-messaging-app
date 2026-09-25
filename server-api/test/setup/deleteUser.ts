import request from 'supertest'

import { jwtCookie } from './utils.js'

const createDeleteUser = app => ({ jwt }) => request(app)
    .delete('/api/users/current')
    .set('Cookie', jwtCookie(jwt))

export default createDeleteUser