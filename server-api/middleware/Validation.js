const { Validator, ValidationError } = require("express-json-validator-middleware")
const addFormats = require("ajv-formats")
const fs = require("fs")

const { isOidValid } = require("../components/Db")

// Get schema files
let schemas = {
    chatCreateSchema: JSON.parse(fs.readFileSync("./schemas/chat_create_schema.json")),
    chatUpdateSchema: JSON.parse(fs.readFileSync("./schemas/chat_update_schema.json")),
    chatUserUpdateSchema: JSON.parse(fs.readFileSync("./schemas/chat_user_update_schema.json")),
    messageCreateSchema: JSON.parse(fs.readFileSync("./schemas/message_create_schema.json")),
    userSignInSchema: JSON.parse(fs.readFileSync("./schemas/user_signin_schema.json")),
    userSignUpSchema: JSON.parse(fs.readFileSync("./schemas/user_signup_schema.json")),
    userUpdateSchema: JSON.parse(fs.readFileSync("./schemas/user_update_schema.json"))
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

exports.validationError = (err, req, res, next) => {
    if (err instanceof ValidationError) {
        console.log(err.validationErrors)
        return res.status(400).send(err)
    }

    next(err)
}

exports.validateId = (idParam) => (req, res, next) => {
    const id = req.params[idParam]

    if (!isOidValid(id)) return res.status(400).json({ message: "Bad id" })

    next()
}