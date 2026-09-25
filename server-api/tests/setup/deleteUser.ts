import request from 'supertest'
import type { Express } from 'express'

import { jwtCookie } from './utils.ts'

interface DeleteUserProps {
    jwt: string
}

const createDeleteUser = (app: Express) => ({ jwt }: DeleteUserProps) => request(app)
    .delete('/api/users/current')
    .set('Cookie', jwtCookie(jwt))

export default createDeleteUser