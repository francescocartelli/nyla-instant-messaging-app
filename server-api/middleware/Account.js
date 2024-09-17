const usersServices = require.main.require("./services/User")

module.exports.validateSingUp = async (req, res, next) => {
    try {
        const user = req.body

        const [isUsername, isEmail] = await Promise.all([
            usersServices.getUser({ username: user.username }),
            usersServices.getUser({ email: user.email })
        ])

        let errorMessage = []
        if (isUsername) errorMessage.push("Username already taken")
        if (isEmail) errorMessage.push("Email already registered")

        if (errorMessage.length > 0) return res.status(400).json({ message: errorMessage.join("\n") })
        else return next()
    } catch (err) { next(err) }
}