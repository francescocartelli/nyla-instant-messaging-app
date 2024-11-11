const { notFoundId, USERNAME_TAKEN, notModified } = require("../components/ResponseMessages")

const usersServices = require("../services/User")

module.exports.getUsers = async (req, res, next) => {
    try {
        const { username, searchType } = req.query

        const users = await usersServices.getUsers(username, searchType)
        res.json(users)
    } catch (err) { next(err) }
}

module.exports.getUser = async (req, res, next) => {
    try {
        const user = await usersServices.getUser({ id: req.params.id })
        if (!user) return res.status(404).json({ message: notFoundId("user") })

        res.json(user)
    } catch (err) { next(err) }
}

module.exports.getCurrentUser = async (req, res, next) => {
    try {
        const { id } = req.user

        const user = await usersServices.getUser({ id: id })
        if (!user) return res.status(404).json({ message: notFoundId("user") })

        res.json(user)
    } catch (err) { next(err) }
}

module.exports.updateUser = async (req, res, next) => {
    try {
        const { username } = req.body

        const user = await usersServices.getUser({ username: username })
        if (user) return res.status(400).json({ message: USERNAME_TAKEN })

        const { modifiedCount } = await usersServices.updateUser(req.params.id, req.body)
        if (modifiedCount < 1) return res.status(304).json({ message: notModified() })

        res.end()
    } catch (err) { next(err) }
}

module.exports.deleteUser = async (req, res) => {
    res.json({ message: `${req} not yet implemented` })
}