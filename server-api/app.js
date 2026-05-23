const express = require('express')
const app = new express()

const dotenv = require('dotenv')
dotenv.config()

const cookieParser = require('cookie-parser')

const { validate, isDev, isTest } = require('./utility/modes')
const { delayedPassThrough } = require('./middleware/constants')

/* LOG */
const { createLogger } = require('./utility/logger')
const log = createLogger(process.env.LOG_LEVEL, isTest(process.env.NODE_ENV))

/* ENVIRONMENT */
const mode = validate(process.env.NODE_ENV)
log.info(`Boot ${mode} mode`)

/* DEVELOPMENT */
if (isDev(process.env.NODE_ENV) && process.env.DELAY_PENALTY) {
	log.info(`A delay penalty of ${process.env.DELAY_PENALTY}ms has been added to all routes`)
	app.use(delayedPassThrough(process.env.DELAY_PENALTY))
}

/* LOG MIDDLEWARE */
if (!isTest(process.env.NODE_ENV)) {
	const { logger } = require('./middleware/logger')
	app.use(logger(mode))
}

/* REQUESTS */
app.use(cookieParser())
app.use(express.json())

/* CORS */
if (process.env.FRONT_END_URL) {
	log.info(`CORS enabled from origin: ${process.env.FRONT_END_URL}`)
	app.use(cors({
		credentials: true,
		origin: process.env.FRONT_END_URL
	}))
}

/* VALIDATION */
const schemas = require('./schemas')
const { validateBody, validateId: createValidateIdMiddleware } = require("./middleware/validation")
const { error: errorMiddleware } = require("./middleware/safety/error")
const { safe: safeController } = require("./middleware/safety/safe")

const validateId = createValidateIdMiddleware(require('./services/DbServices').checkOid)

/* PASSPORT */
const passport = require('passport')
app.use(passport.initialize())
const authenticate = passport.authenticate('jwt', { session: false })

const { useJWTtrategy, useGoogleStrategy } = require('./middleware/PStrategies')
passport.use("jwt", useJWTtrategy({ secretOrKey: process.env.SECRET_OR_KEY }))

if (process.env.GOOGLE_CLIENT_ID) passport.use(useGoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: process.env.GOOGLE_CALLBACK_URL
}))

/* CONTROLLERS */
const initAccountControllers = require('./controllers/Account')
const chatControllers = require('./controllers/Chat')
const messageControllers = require('./controllers/Message')
const userControllers = require('./controllers/User')

/* MIDDLEWARES */
const chatMiddleware = require('./middleware/Chat')
const userMiddleware = require('./middleware/User')
const accountMiddlewares = require('./middleware/Account')
const messageMiddlewares = require('./middleware/Message')

/* CONSTANTS */
const { SERVER_ERROR } = require('./constants/ResponseMessages')

/* ----- */
/* CHATS */
/* ----- */
app.get('/api/chats/personal', authenticate, safeController(chatControllers.getChatsPersonal))
app.get('/api/chats/:id', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), safeController(chatControllers.getChat))
app.post('/api/chats', authenticate, validateBody(schemas.chatCreateSchema), safeController(chatControllers.createChat))
app.put('/api/chats/:id', authenticate, validateId('id'), validateBody(schemas.chatUpdateSchema), chatMiddleware.isUserInChat('id', { isAdminRequired: true, isGroupRequired: true }), safeController(chatControllers.updateChat))
app.delete('/api/chats/:id', authenticate, validateId('id'), chatMiddleware.isUserInChat('id', { isAdminRequired: true }), safeController(chatControllers.deleteChat))
app.post('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), chatMiddleware.isUserInChat('id', { isAdminRequired: true, isGroupRequired: true }), safeController(chatControllers.addUser))
app.put('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), validateBody(schemas.chatUserUpdateSchema), chatMiddleware.isUserInChat('id', { isAdminRequired: true, isGroupRequired: true }), safeController(chatControllers.updateUser))
app.delete('/api/chats/:id/users/current', authenticate, validateId('id'), chatMiddleware.isUserInChat('id', { isGroupRequired: true }), safeController(chatControllers.removeCurrentUser))
app.delete('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), chatMiddleware.isUserInChat('id', { isAdminRequired: true, isGroupRequired: true }), safeController(chatControllers.removeUser))
app.get('/api/chats/:id/users', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), safeController(chatControllers.getUsers))

/* -------- */
/* MESSAGES */
/* -------- */
app.get('/api/chats/:id/messages', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), safeController(messageControllers.getMessages))
app.post('/api/chats/:id/messages', authenticate, validateId('id'), validateBody(schemas.messageCreateSchema), chatMiddleware.isUserInChat('id'), safeController(messageControllers.createMessage))
app.get('/api/chats/:id/messages/:idm', authenticate, validateId('id'), validateId('idm'), chatMiddleware.isUserInChat('id'), safeController(messageControllers.getMessage))
app.put('/api/chats/:id/messages/:idm', authenticate, validateId('id'), validateId('idm'), validateBody(schemas.messageCreateSchema), chatMiddleware.isUserInChat('id'), messageMiddlewares.isMessageAuthor('id', 'idm'), safeController(messageControllers.updateMessage))
app.delete('/api/chats/:id/messages/:idm', authenticate, validateId('id'), validateId('idm'), chatMiddleware.isUserInChat('id'), messageMiddlewares.isMessageAuthor('id', 'idm'), safeController(messageControllers.deleteMessage))

/* ----- */
/* USERS */
/* ----- */
app.get('/api/users', safeController(userControllers.getUsers))
app.get('/api/users/current', authenticate, safeController(userControllers.getCurrentUser))
app.get('/api/users/:id', validateId('id'), safeController(userControllers.getUser))
app.put('/api/users/:id', authenticate, validateId('id'), userMiddleware.isUserCurrent('id'), validateBody(schemas.userUpdateSchema), safeController(userControllers.updateUser))
app.delete('/api/users/current', authenticate, safeController(userControllers.deleteUser))

/* ------------ */
/* AUTHENTICATE */
/* ------------ */
const accountControllers = initAccountControllers(process.env.SECRET_OR_KEY, {
	httpOnly: true,
	secure: false, // when using https set it to true,
	sameSite: 'strict',
	maxAge: 1000 * 60 * 60 * 24
})

app.post('/api/authenticate/signup', validateBody(schemas.userSignUpSchema), accountMiddlewares.validateSingUp, safeController(accountControllers.signUp))
app.post('/api/authenticate/signin', validateBody(schemas.userSignInSchema), safeController(accountControllers.signIn))
app.post('/api/authenticate/logout', authenticate, safeController(accountControllers.logOut))

if (process.env.GOOGLE_CLIENT_ID) {
	app.get('/api/authenticate/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
	app.get('/api/authenticate/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), safeController(accountControllers.providerCallback(process.env.GOOGLE_SUCCESS_REDIRECT_URL)))
}

app.use(errorMiddleware({
	onError: log.error,
	message: SERVER_ERROR
}))

module.exports = app