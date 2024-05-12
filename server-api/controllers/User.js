const usersServices = require.main.require('./services/User')

module.exports.getUsers = async (req, res) => {
    const username = req.query.username
    const searchType = req.query.searchType

    try {
        const users = await usersServices.getUsers(username, searchType)
        res.json(users)
    } catch (err) {
        if (err instanceof TypeError) res.status(400).send(err.message)
        else res.status(500).json(err)
    }
}

module.exports.getUser = async (req, res) => {
    try {
        const user = await usersServices.getUser({ id: req.params.id })

        if (user) res.json(user)
        else res.status(404).send("User not found with specified id")
    } catch (err) {
        res.status(500).json(err)
    }
}

module.exports.getCurrentUser = async (req, res) => {
    try {
        const { id } = req.user

        const user = await usersServices.getUser({ id: id })

        if (user) res.json(user)
        else res.status(404).send("User not found with specified id")
    } catch (err) {
        res.status(500).json(err)
    }
}

module.exports.updateUser = async (req, res) => {
    try {
        const { username } = req.body

        const user = await usersServices.getUser({ username: username })

        if (user) return res.status(400).send("Username already taken")

        const { modifiedCount } = await usersServices.updateUser(req.params.id, req.body)

        if (modifiedCount > 0) res.end()
        else res.status(304).json("No data has been updated")
    } catch (err) {
        res.status(500).json(err)
    }
}

module.exports.deleteUser = async (req, res) => {
    res.json({ message: `${req} not yet implemented` })
}