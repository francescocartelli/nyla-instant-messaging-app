import type { CookieOptions, Request, Response } from "express"
import jwt from 'jsonwebtoken'

import { notFoundId, SIGN_IN_FAILED, SIGN_UP_FAILED } from '../constants/ResponseMessages.ts'

import type { UserSignup } from '../types/bodies/UserSignup.ts'
import type { UserSignin } from '../types/bodies/UserSignin.ts'

import { User } from "../model/User.ts"

import accountServices from '../services/Account.ts'
import usersServices from '../services/User.ts'

const init = (secret: string, cookieOptions: CookieOptions) => {
    const cookieCode = 'jwt'

    const generateToken = ({ id }: Partial<User>) => jwt.sign(accountServices.tokenPayload(id!.toString()), secret)
    const generateCookieToken = (user: Partial<User>): [string, string, CookieOptions] => [cookieCode, generateToken(user), cookieOptions]

    const signUp = async (
        req: Request<{}, {}, UserSignup>,
        res: Response
    ) => {
        const { password, ...u } = req.body

        const hash = await accountServices.getHash(password)

        const { insertedId } = await usersServices.createUser({ ...u, hash: hash })
        if (!insertedId) return res.status(304).json({ message: SIGN_UP_FAILED })

        const regUser = { id: insertedId, username: u.username, email: u.email }

        res.cookie(...generateCookieToken(regUser))
        res.json(regUser)
    }

    const signIn = async (
        req: Request<{}, {}, UserSignin>,
        res: Response
    ) => {
        const { userIdentifier, password } = req.body

        const u = await usersServices.getUserHash(userIdentifier)
        if (!u) return res.status(401).json({ message: SIGN_IN_FAILED })

        const { id, hash } = u
        if (!hash || !(await accountServices.compare(password, hash))) return res.status(401).json({ message: SIGN_IN_FAILED })

        const user = await usersServices.getUser({ id: id.toString() })
        if (!user) return res.status(404).json({ message: notFoundId('user') })

        res.cookie(...generateCookieToken(user))
        res.json(user)
    }

    const providerCallback = (redirectUrl: string) => (req: Request, res: Response) => {
        if (!req.user) return

        res.cookie(...generateCookieToken(req.user))
        res.redirect(redirectUrl)
    }

    const logOut = (req: Request, res: Response) => req.logOut(() => {
        res.clearCookie(cookieCode)
        res.redirect("/")
    })

    return {
        signUp,
        signIn,
        providerCallback,
        logOut
    }
}

export default init