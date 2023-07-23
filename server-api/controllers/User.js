const usersServices = require.main.require('./services/User')

module.exports.getUsers = async (req, res) => {
    const username = req.query.username

    if (!username || username === "") return res.json([])

    usersServices.getUsers(username).then((user) => {
        if (!user) res.status(404).send("User not found with specified id")
        else res.json(user)
    }).catch((err) => {
        res.status(500).json(err)
    })
}

module.exports.getUser = async (req, res) => {
    usersServices.getUser({ id: req.params.id }).then((user) => {
        if (!user) res.status(404).send("User not found with specified id")
        else res.json(user)
    }).catch((err) => {
        res.status(500).json(err)
    })
}

module.exports.getCurrentUser = async (req, res) => {
    const user = req.user

    usersServices.getUser({ id: user.id }).then((user) => {
        if (!user) res.status(404).send("User not found with specified id")
        else res.json(user)
    }).catch((err) => {
        res.status(500).json(err)
    })
}

module.exports.updateUser = async (req, res) => {
    const u = req.body

    try {
        if (u.username && (await usersServices.getUser({ username: u.username }))) res.status(400).send("Username already taken")

        const { modifiedCount } = await usersServices.updateUser(req.params.id, u)

        if (modifiedCount > 0) res.end()
        else res.status(304).json("No data has been updated")
    } catch (err) {
        res.status(500).json(err)
    }
}

module.exports.deleteUser = async (req, res) => {
    res.json({ message: `${req} not already implemented` })
}