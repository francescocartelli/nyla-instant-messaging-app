const { Validator, ValidationError } = require("express-json-validator-middleware")

const dbServices = require("../services/DbServices")

const validator = new Validator({ allErrors: true })

exports.validate = validator.validate

exports.validationError = (err, req, res, next) => {
    if (err instanceof ValidationError) {
        console.log(err.validationErrors)
        return res.status(400).send(err)
    }

    next(err)
}

exports.validateId = (idParam) => (req, res, next) => {
    const id = req.params[idParam]

    if (!dbServices.checkOid(id)) return res.status(400).json({ message: "Bad id" })

    next()
}