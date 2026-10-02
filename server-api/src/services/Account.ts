import bcrypt from 'bcrypt'
import type { JwtPayload } from "jsonwebtoken"
import { JwtFromRequestFunction } from 'passport-jwt'

const jwtCode = 'jwt'
const saltOrRounds = 10

const getDate = () => Math.floor(Date.now() / 1000)
const day = (n = 1) => n * (60 * 60 * 24)

const getHash = (password: string): Promise<string> => bcrypt.hash(password, saltOrRounds)
const compare = bcrypt.compare

const tokenPayload = (sub: string) => ({
    sub,
    iat: getDate(),
    exp: getDate() + day()
})

const cookieExtractor: JwtFromRequestFunction = req => (req && req.cookies) ? req.cookies[jwtCode] : null
const verifyPayload = ({ exp }: JwtPayload) => exp && getDate() < exp

export default {
    getHash,
    compare,
    tokenPayload,
    cookieExtractor,
    verifyPayload
}