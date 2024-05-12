const bcrypt = require('bcrypt')

require('dotenv').config()

const usersServices = require.main.require('./services/User')

const { newUser } = require.main.require('./components/User')
const { generateToken, getCookieParams } = require.main.require('./components/JwtUtils')

module.exports.signUp = async (req, res) => {
    try {
        const user = req.body

        const [isUsername, isEmail] = await Promise.all([
            usersServices.getUser({ username: user.username }),
            usersServices.getUser({ email: user.email })
        ])

        let errorMessage = []
        if (isUsername) errorMessage.push("Username already taken")
        if (isEmail) errorMessage.push("Email already registered")

        if (errorMessage.length > 0) return res.status(400).send({ message: errorMessage.join("\n") })

        const { password, ...u } = user

        const hash = await bcrypt.hash(password, parseInt(process.env.SALT_OR_ROUNDS))
        const { insertedId } = await usersServices.createUser(newUser({ ...u, hash: hash }))

        const regUser = { id: insertedId, username: user.username, email: user.email }
        const token = generateToken(regUser)

        res.cookie(...getCookieParams(token))
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
        if (!u) return res.status(401).json({ message: 'Authentication failed, wrong username or password' })
        
        const { id, hash } = u
        // check for password
        if (await bcrypt.compare(password, hash)) {
            const user = await usersServices.getUser({ id: id })
            const token = generateToken(user)

            res.cookie(...getCookieParams(token))
            res.json(user)
        } else res.status(401).json({ message: 'Authentication failed, wrong username or password' })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

module.exports.logOut = async (req, res) => {
    req.logOut(() => {
        res.clearCookie('jwt')
        res.redirect('/')
    })
}