const jwt = require('jsonwebtoken')

const { SIGN_IN_FAILED, SIGN_UP_FAILED } = require('../constants/ResponseMessages')

const usersServices = require("../services/User")
const accountServices = require('../services/Account')

const init = (secret, cookieOptions) => {
    const cookieCode = 'jwt'

    const generateToken = ({ id }) => jwt.sign(accountServices.tokenPayload(id), secret)
    const generateCookieToken = user => [cookieCode, generateToken(user), cookieOptions]

    const signUp = async (req, res) => {
        const { password, ...u } = req.body

        const hash = await accountServices.getHash(password)

        const { insertedId } = await usersServices.createUser({ ...u, hash: hash })
        if (!insertedId) return res.status(304).json({ message: SIGN_UP_FAILED })

        const regUser = { id: insertedId, username: u.username, email: u.email }

        res.cookie(...generateCookieToken(regUser))
        res.json(regUser)
    }

    const signIn = async (req, res) => {
        const { userIdentifier, password } = req.body

        const u = await usersServices.getUserHash(userIdentifier)
        if (!u) return res.status(401).json({ message: SIGN_IN_FAILED })

        const { id, hash } = u
        if (!hash || !(await accountServices.compare(password, hash))) return res.status(401).json({ message: SIGN_IN_FAILED })

        const user = await usersServices.getUser({ id: id })

        res.cookie(...generateCookieToken(user))
        res.json(user)
    }

    const providerCallback = redirectUrl => (req, res) => {
        res.cookie(...generateCookieToken(req.user))
        res.redirect(redirectUrl)
    }

    const logOut = (req, res) => req.logOut(() => {
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

module.exports = init