const chatCreateSchema = require("./chat_create_schema.json")
const chatUpdateSchema = require("./chat_update_schema.json")
const chatUserUpdateSchema = require("./chat_user_update_schema.json")
const messageCreateSchema = require("./message_create_schema.json")
const userSignInSchema = require("./user_signin_schema.json")
const userSignUpSchema = require("./user_signup_schema.json")
const userUpdateSchema = require("./user_update_schema.json")

const schemas = {
    chatCreateSchema,
    chatUpdateSchema,
    chatUserUpdateSchema,
    messageCreateSchema,
    userSignInSchema,
    userSignUpSchema,
    userUpdateSchema
}

module.exports = schemas