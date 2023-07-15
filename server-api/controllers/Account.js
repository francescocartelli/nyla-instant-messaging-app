const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

require('dotenv').config()

const usersServices = require.main.require('./services/User')
const { getDate, day } = require.main.require('./components/utils')
const { newUser } = require.main.require('./components/User')

const generateToken = ({ id }) => {
    const payload = {
        sub: id,
        iat: getDate(),
        exp: getDate() + day()
    }
    return jwt.sign(payload, process.env.SECRET_OR_KEY)
}

module.exports.signUp = async (req, res) => {
    const user = req.body

    try {
        const [isUsername, isEmail] = await Promise.all([
            usersServices.getUser({ username: user.username }),
            usersServices.getUser({ email: user.email })
        ])

        let errorMessage = []
        if (isUsername) errorMessage.push("Username already taken")
        if (isEmail) errorMessage.push("Email already registered")

        if (errorMessage.length > 0) res.status(400).send(errorMessage.join("\n"))
        else {
            const { password, ...u } = user

            bcrypt.hash(password, parseInt(process.env.SALT_OR_ROUNDS)).then(hash => {
                usersServices.createUser(newUser({...u, hash: hash})).then((results) => {
                    const regUser = {id: results.insertedId, username: user.username, email:user.email}

                    const token = generateToken(regUser)

                    res.cookie('jwt', token, { httpOnly: true, secure: false })
                    res.json(regUser)
                })
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

module.exports.singIn = async (req, res) => {
    const { username, password } = req.body

    try {
        const u = await usersServices.getHash({ username: username })

        // check for username
        if (u) {
            const { id, hash } = u
            // check for password
            if (await bcrypt.compare(password, hash)) {
                const user = await usersServices.getUser({ id: id })
                const token = generateToken(user)

                res.cookie('jwt', token, { httpOnly: true, secure: false })
                res.json(user)
            } else {
                res.status(401).json({ message: 'Authentication failed, wrong username or password' })
            }
        } else {
            res.status(401).json({ message: 'Authentication failed, wrong username or password' })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

module.exports.logOut = async (req, res) => {
    req.logout()
    res.clearCookie('jwt').end()
}