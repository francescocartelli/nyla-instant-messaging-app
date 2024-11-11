const { USER_REQUIRED } = require("../components/ResponseMessages")

exports.isUserCurrent = (idParam) => (req, res, next) => {
    const user = req.user

    if (user.id.toString() !== req.params[idParam]) return res.status(401).json({ message: USER_REQUIRED })

    next()
}