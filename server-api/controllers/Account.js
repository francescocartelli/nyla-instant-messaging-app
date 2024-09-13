const usersServices = require.main.require("./services/User")

const { getHash, compare } = require.main.require("./components/CryptoUtils")
const { newUser } = require.main.require("./components/User")
const { generateCookieToken } = require.main.require("./components/JwtUtils")

require("dotenv").config()

module.exports.signUp = async (req, res) => {
    try {
        const { password, ...u } = req.body

        const hash = await getHash(password)

        const { insertedId } = await usersServices.createUser(newUser({ ...u, hash: hash }))
        if (!insertedId) return res.status(304).json({ message: "No user has been registered" })

        const regUser = { id: insertedId, username: u.username, email: u.email }

        res.cookie(...generateCookieToken(regUser))
        res.json(regUser)
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

module.exports.singIn = async (req, res) => {
    try {
        const { username, password } = req.body

        const u = await usersServices.getHash({ username: username })

        // check for username
        if (!u) return res.status(401).json({ message: "Authentication failed, wrong username or password" })

        const { id, hash } = u
        // check for password
        if (!(await compare(password, hash))) return res.status(401).json({ message: "Authentication failed, wrong username or password" })

        const user = await usersServices.getUser({ id: id })

        res.cookie(...generateCookieToken(user))
        res.json(user)
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

module.exports.logOut = async (req, res) => {
    req.logOut(() => {
        res.clearCookie("jwt")
        res.redirect("/")
    })
}