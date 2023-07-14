const usersServices = require.main.require('./services/User')

module.exports.getUsers = async (req, res) => {
    const username = req.query.username

    if (!username || username === "") {
        res.status(400).send("Missing username parameter")
        return
    }

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