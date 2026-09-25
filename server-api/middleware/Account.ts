import { EMAIL_TAKEN, USERNAME_TAKEN } from "../constants/ResponseMessages.js"

import usersServices from "../services/User.js"

export const validateSingUp = async (req, res, next) => {
    try {
        const user = req.body

        const [isUsername, isEmail] = await Promise.all([
            usersServices.getUser({ username: user.username }),
            usersServices.getUser({ email: user.email })
        ])

        let errorMessage = []
        if (isUsername) errorMessage.push(USERNAME_TAKEN)
        if (isEmail) errorMessage.push(EMAIL_TAKEN)

        if (errorMessage.length > 0) return res.status(400).json({ message: errorMessage.join("\n") })
        else return next()
    } catch (err) { next(err) }
}