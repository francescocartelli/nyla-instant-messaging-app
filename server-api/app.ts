import cors from 'cors'
import express, { type Express } from 'express'

const app: Express = express()

import dotenv from 'dotenv'
dotenv.config()

import cookieParser from 'cookie-parser'

import { delayedPassThrough } from './src/middleware/constants/index.ts'
import { isDev, isTest, validate } from './src/utility/modes.ts'

/* LOG */
import { getLogger } from './src/utility/logger.ts'
const log = getLogger()

/* ENVIRONMENT */
const mode = validate(process.env.NODE_ENV as string)
log?.info(`Boot ${mode} mode`)

/* DEVELOPMENT */
if (isDev(process.env.NODE_ENV as string) && process.env.DELAY_PENALTY) {
	log?.info(`A delay penalty of ${process.env.DELAY_PENALTY}ms has been added to all routes`)
	app.use(delayedPassThrough(parseInt(process.env.DELAY_PENALTY)))
}

/* LOG MIDDLEWARE */
import { logger } from "./src/middleware/logger.ts"
if (!isTest(process.env.NODE_ENV as string)) {
	app.use(logger(mode))
}

/* REQUESTS */
app.use(cookieParser())
app.use(express.json())

/* CORS */
if (process.env.FRONT_END_URL) {
	log?.info(`CORS enabled from origin: ${process.env.FRONT_END_URL}`)
	app.use(cors({
		credentials: true,
		origin: process.env.FRONT_END_URL
	}))
}

/* VALIDATION */
import { error as errorMiddleware } from "./src/middleware/safety/error.ts"
import { safe as safeController } from "./src/middleware/safety/safe.ts"
import { validateId as createValidateIdMiddleware, validateBody } from "./src/middleware/validation/index.ts"
import schemas from './src/schemas/index.ts'

import { checkOid } from './src/services/DbServices.ts'

const validateId = createValidateIdMiddleware(checkOid)

/* PASSPORT */
import passport from 'passport'

app.use(passport.initialize())
const authenticate = passport.authenticate('jwt', { session: false })

import { useGoogleStrategy, useJWTtrategy } from './src/middleware/PStrategies/index.ts'
if (process.env.SECRET_OR_KEY) passport.use("jwt", useJWTtrategy({ secretOrKey: process.env.SECRET_OR_KEY as string } as any))

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) passport.use(useGoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: process.env.GOOGLE_CALLBACK_URL
}))

/* CONTROLLERS */
import initAccountControllers from './src/controllers/Account.ts'
import * as chatControllers from './src/controllers/Chat.ts'
import * as messageControllers from './src/controllers/Message.ts'
import * as userControllers from './src/controllers/User.ts'

/* MIDDLEWARES */
import * as accountMiddlewares from './src/middleware/Account.ts'
import * as chatMiddleware from './src/middleware/Chat.ts'
import * as messageMiddlewares from './src/middleware/Message.ts'
import * as userMiddleware from './src/middleware/User.ts'

/* CONSTANTS */
import { SERVER_ERROR } from './src/constants/texts.ts'

/* ----- */
/* CHATS */
/* ----- */
app.get('/api/chats/personal', authenticate, safeController(chatControllers.getChatsPersonal))
app.get('/api/chats/:id', authenticate, validateId('id'), safeController(chatMiddleware.isUserInChat('id')), safeController(chatControllers.getChat))
app.post('/api/chats', authenticate, validateBody(schemas.chatCreateSchema), safeController(chatControllers.createChat))
app.put('/api/chats/:id', authenticate, validateId('id'), validateBody(schemas.chatUpdateSchema), safeController(chatMiddleware.isUserInChat('id', { isAdminRequired: true, isGroupRequired: true })), safeController(chatControllers.updateChat))
app.delete('/api/chats/:id', authenticate, validateId('id'), safeController(chatMiddleware.isUserInChat('id', { isAdminRequired: true })), safeController(chatControllers.deleteChat))
app.post('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), safeController(chatMiddleware.isUserInChat('id', { isAdminRequired: true, isGroupRequired: true })), safeController(chatControllers.addUser))
app.put('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), validateBody(schemas.chatUserUpdateSchema), safeController(chatMiddleware.isUserInChat('id', { isAdminRequired: true, isGroupRequired: true })), safeController(chatControllers.updateUser))
app.delete('/api/chats/:id/users/current', authenticate, validateId('id'), safeController(chatMiddleware.isUserInChat('id', { isGroupRequired: true })), safeController(chatControllers.removeCurrentUser))
app.delete('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), safeController(chatMiddleware.isUserInChat('id', { isAdminRequired: true, isGroupRequired: true })), safeController(chatControllers.removeUser))
app.get('/api/chats/:id/users', authenticate, validateId('id'), safeController(chatMiddleware.isUserInChat('id')), safeController(chatControllers.getUsers))

/* -------- */
/* MESSAGES */
/* -------- */
app.get('/api/chats/:id/messages', authenticate, validateId('id'), safeController(chatMiddleware.isUserInChat('id')), safeController(messageControllers.getMessages))
app.post('/api/chats/:id/messages', authenticate, validateId('id'), validateBody(schemas.messageCreateSchema), safeController(chatMiddleware.isUserInChat('id')), safeController(messageControllers.createMessage))
app.get('/api/chats/:id/messages/:idm', authenticate, validateId('id'), validateId('idm'), safeController(chatMiddleware.isUserInChat('id')), safeController(messageControllers.getMessage))
app.put('/api/chats/:id/messages/:idm', authenticate, validateId('id'), validateId('idm'), validateBody(schemas.messageCreateSchema), safeController(chatMiddleware.isUserInChat('id')), safeController(messageMiddlewares.isMessageAuthor('id', 'idm')), safeController(messageControllers.updateMessage))
app.delete('/api/chats/:id/messages/:idm', authenticate, validateId('id'), validateId('idm'), safeController(chatMiddleware.isUserInChat('id')), safeController(messageMiddlewares.isMessageAuthor('id', 'idm')), safeController(messageControllers.deleteMessage))

/* ----- */
/* USERS */
/* ----- */
app.get('/api/users', safeController(userControllers.getUsers))
app.get('/api/users/current', authenticate, safeController(userControllers.getCurrentUser))
app.get('/api/users/:id', validateId('id'), safeController(userControllers.getUser))
app.put('/api/users/:id', authenticate, validateId('id'), safeController(userMiddleware.isUserCurrent('id')), validateBody(schemas.userUpdateSchema), safeController(userControllers.updateUser))
app.delete('/api/users/current', authenticate, safeController(userControllers.deleteUser))

/* ------------ */
/* AUTHENTICATE */
/* ------------ */
const accountControllers = initAccountControllers(process.env.SECRET_OR_KEY as string, {
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
	app.get('/api/authenticate/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), safeController(accountControllers.providerCallback(process.env.GOOGLE_SUCCESS_REDIRECT_URL as string)))
}

app.use(errorMiddleware({
	onError: log?.error,
	message: SERVER_ERROR
}))

export default app