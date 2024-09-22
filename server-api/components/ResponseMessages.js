exports.NO_CHAT_DELETED = "No chat was deleted"
exports.NO_MESSAGES_DELETED = "No messages were deleted"

exports.notFoundId = (resource = "data") => `No ${resource} has been found with specified identifier`
exports.notCreated = (resource = "data") => `No ${resource} has been created`
exports.notModified = (resource = "data") => `No ${resource} has been modified`
exports.notDeleted = (resource = "data") => `No ${resource} has been deleted`

exports.USERNAME_TAKEN = "Username already taken"
exports.EMAIL_TAKEN = "Email already registered"
exports.SIGN_UP_FAILED = "No user has been registered" 
exports.SIGN_IN_FAILED = "Authentication failed, wrong username or password"

exports.USER_REQUIRED = "Only user can perform this operation"
exports.GROUP_CHATS_OPERATION = "Only group chats allow this operation"
exports.SENDER_REQUIRED = "Only the message sender can perform this operation"
exports.ADMIN_REQUIRED = "Only chat administrators can perform this operation"
exports.USER_IN_CHAT_REQUIRED = "Only chat users can perform this operation"

exports.SERVER_ERROR = "Internal Server Error"