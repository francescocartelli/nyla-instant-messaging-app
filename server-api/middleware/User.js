exports.isUserCurrent = (idParam) => {
    return (req, res, next) => {
        const user = req.user
    
        if (user.id.toString() === req.params[idParam]) next()
        else res.status(401).send("You cannot edit other user identity")
    }
}