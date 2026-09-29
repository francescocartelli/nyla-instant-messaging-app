import cookieParser from 'cookie-parser'
import type { IncomingMessage } from 'node:http'
import { Identifiable } from '../types/User.ts'

const cookieParserMiddleware = cookieParser()

type CookieRequest = IncomingMessage & {
    cookies?: Record<string, string>
}

const extractCookieJWT = (req: CookieRequest): string | undefined => req.cookies?.jwt

const extractJWT = (req: CookieRequest): Promise<string | undefined> => new Promise((resolve, reject) => cookieParserMiddleware(req as any, {} as any, () => {
    try {
        resolve(extractCookieJWT(req))
    } catch (err) {
        reject(err)
    }
}))

type RetrieveUser = (jwt: string) => Promise<Identifiable>

const createGetCurrentUser = (retrieveUser: RetrieveUser) => async (req: CookieRequest) => {
    const jwt = await extractJWT(req)
    if (!jwt) throw new Error("Missing JWT cookie")

    return retrieveUser(jwt)
}

export default createGetCurrentUser