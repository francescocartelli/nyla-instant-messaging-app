const Ajv = require('ajv')
const addFormats = require('ajv-formats')

const dbServices = require("../services/DbServices")

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

const addSchema = schema => ajv.addSchema(schema)

const validateBody = schema => {
    const validate = ajv.compile(schema)

    return (req, res, next) => {
        const isValid = validate(req.body)
        
        if (!isValid) return res.status(400).json({
            errors: validate.errors.map(err => ({
                field: err.instancePath || err.params.missingProperty,
                message: err.message
            }))
        })

        next()
    }
}

exports.validateBody = validateBody
exports.addSchema = addSchema

exports.validateId = (idParam) => (req, res, next) => {
    const id = req.params[idParam]

    if (!dbServices.checkOid(id)) return res.status(400).json({ message: "Bad id" })

    next()
}