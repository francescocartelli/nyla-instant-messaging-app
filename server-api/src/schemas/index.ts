import chatCreateSchema from "./chat_create_schema.json" with { type: "json" }
import chatUpdateSchema from "./chat_update_schema.json" with { type: "json" }
import chatUserUpdateSchema from "./chat_user_update_schema.json" with { type: "json" }
import messageCreateSchema from "./message_create_schema.json" with { type: "json" }
import userSignInSchema from "./user_signin_schema.json" with { type: "json" }
import userSignUpSchema from "./user_signup_schema.json" with { type: "json" }
import userUpdateSchema from "./user_update_schema.json" with { type: "json" }

const schemas = {
    chatCreateSchema,
    chatUpdateSchema,
    chatUserUpdateSchema,
    messageCreateSchema,
    userSignInSchema,
    userSignUpSchema,
    userUpdateSchema
}

export default schemas