const validate = validationFunction => idParam => (req, res, next) => {
    if (!validationFunction(req.params[idParam])) return res.status(400).json({ message: "Bad id" })

    next()
}

module.exports = validate