import express from 'express'

const app = new express()

import dotenv from 'dotenv'
dotenv.config()

import cookieParser from 'cookie-parser'

import { delayedPassThrough } from './middleware/constants/index.js'
import { isDev, isTest, validate } from './utility/modes.js'

/* LOG */
import { getLogger } from './utility/logger.js'
const log = getLogger()

/* ENVIRONMENT */
const mode = validate(process.env.NODE_ENV)
log.info(`Boot ${mode} mode`)

/* DEVELOPMENT */
if (isDev(process.env.NODE_ENV) && process.env.DELAY_PENALTY) {
	log.info(`A delay penalty of ${process.env.DELAY_PENALTY}ms has been added to all routes`)
	app.use(delayedPassThrough(process.env.DELAY_PENALTY))
}

/* LOG MIDDLEWARE */
import { logger } from "./middleware/logger.js"
if (!isTest(process.env.NODE_ENV)) {
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
import { error as errorMiddleware } from "./middleware/safety/error.js"
import { safe as safeController } from "./middleware/safety/safe.js"
import { validateId as createValidateIdMiddleware, validateBody } from "./middleware/validation/index.js"
import schemas from './schemas/index.js'

import { checkOid } from './services/DbServices.js'

const validateId = createValidateIdMiddleware(checkOid)

/* PASSPORT */
import passport from 'passport'

app.use(passport.initialize())
const authenticate = passport.authenticate('jwt', { session: false })

import { useGoogleStrategy, useJWTtrategy } from './middleware/PStrategies/index.js'
passport.use("jwt", useJWTtrategy({ secretOrKey: process.env.SECRET_OR_KEY }))

if (process.env.GOOGLE_CLIENT_ID) passport.use(useGoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: process.env.GOOGLE_CALLBACK_URL
}))

/* CONTROLLERS */
import initAccountControllers from './controllers/Account.js'
import * as chatControllers from './controllers/Chat.js'
import * as messageControllers from './controllers/Message.js'
import * as userControllers from './controllers/User.js'

/* MIDDLEWARES */
import * as accountMiddlewares from './middleware/Account.js'
import * as chatMiddleware from './middleware/Chat.js'
import * as messageMiddlewares from './middleware/Message.js'
import * as userMiddleware from './middleware/User.js'

/* CONSTANTS */
import { SERVER_ERROR } from './constants/ResponseMessages.js'

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

export default app