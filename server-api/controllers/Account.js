const jwt = require('jsonwebtoken')

const { SIGN_UP_FAILED, SIGN_IN_FAILED } = require("../components/ResponseMessages")
const { newUser } = require("../components/User")

const usersServices = require("../services/User")
const { getHash, compare, tokenPayload } = require('../services/Account')

const init = (secret, cookieOptions) => {
    const cookieCode = 'jwt'

    const generateToken = ({ id }) => jwt.sign(tokenPayload(id), secret)
    const generateCookieToken = user => [cookieCode, generateToken(user), cookieOptions]

    const signUp = async (req, res, next) => {
        try {
            const { password, ...u } = req.body

            const hash = await getHash(password)

            const { insertedId } = await usersServices.createUser(newUser({ ...u, hash: hash }))
            if (!insertedId) return res.status(304).json({ message: SIGN_UP_FAILED })

            const regUser = { id: insertedId, username: u.username, email: u.email }

            res.cookie(...generateCookieToken(regUser))
            res.json(regUser)
        } catch (err) { next(err) }
    }

    const signIn = async (req, res, next) => {
        try {
            const { userIdentifier, password } = req.body

            const u = await usersServices.getUserHash(userIdentifier)
            if (!u) return res.status(401).json({ message: SIGN_IN_FAILED })

            const { id, hash } = u
            if (!hash || !(await compare(password, hash))) return res.status(401).json({ message: SIGN_IN_FAILED })

            const user = await usersServices.getUser({ id: id })

            res.cookie(...generateCookieToken(user))
            res.json(user)
        } catch (err) { next(err) }
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