exports.isUserCurrent = (idParam) => (req, res, next) => {
    const user = req.user

    if (user.id.toString() !== req.params[idParam]) return res.status(401).send("You cannot edit other user identity")

    next()
}