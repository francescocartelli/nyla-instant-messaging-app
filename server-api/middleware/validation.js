const { Validator, ValidationError } = require('express-json-validator-middleware')
const addFormats = require("ajv-formats")
const { ObjectId } = require('mongodb')
var fs = require("fs")

// Get schema files
let schemas = {
    userSignUpSchema: JSON.parse(fs.readFileSync('./schemas/user_signup_schema.json')),
    userSignInSchema: JSON.parse(fs.readFileSync('./schemas/user_signin_schema.json'))
}

// Instance a validator 
let validator = new Validator({ allErrors: true })
// Add formats to validator
addFormats(validator.ajv)
// Add schemas
validator.ajv.addSchema(Object.values(schemas))

// Utility objects

exports.schemas = schemas

exports.validate = validator.validate

// Validator middleware

exports.validateId = function(idParam) {
    return function (req, res, next) {
        const id = req.params[idParam]
        if (!ObjectId.isValid(id)) res.status(400).send("Bad id")
        else next()
    }
}

exports.validationError = function (err, req, res, next) {
    if (err instanceof ValidationError) {
        res.status(400).send(err)
        console.log(err)
        console.log(err.validationErrors)
    } else next(err)
}