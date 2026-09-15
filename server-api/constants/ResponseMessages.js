export const NO_CHAT_DELETED = "No chat was deleted"
export const NO_MESSAGES_DELETED = "No messages were deleted"

export const notFoundId = (resource = "data") => `No ${resource} has been found with specified identifier`
export const notCreated = (resource = "data") => `No ${resource} has been created`
export const notModified = (resource = "data") => `No ${resource} has been modified`
export const notDeleted = (resource = "data") => `No ${resource} has been deleted`

export const USERNAME_TAKEN = "Username already taken"
export const EMAIL_TAKEN = "Email already registered"
export const SIGN_UP_FAILED = "No user has been registered"
export const SIGN_IN_FAILED = "Authentication failed, wrong username or password"

export const USER_REQUIRED = "Only user can perform this operation"
export const GROUP_CHATS_OPERATION = "Only group chats allow this operation"
export const SENDER_REQUIRED = "Only the message sender can perform this operation"
export const ADMIN_REQUIRED = "Only chat administrators can perform this operation"
export const USER_IN_CHAT_REQUIRED = "Only chat users can perform this operation"

export const TOO_LATE = "This operation can no longer be executed"

export const IDENTITY_NO_EMAIL = "Identity is not associated to any email"

export const SERVER_ERROR = "Internal Server Error"