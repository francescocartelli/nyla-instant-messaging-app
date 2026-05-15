const Ajv = require('ajv')
const addFormats = require('ajv-formats')

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

const validate = schema => {
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

module.exports = validate