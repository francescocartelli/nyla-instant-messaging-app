'use strict'

const express = require('express')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

require('dotenv').config()

/* Validator middleware */
const schemas = require('./schemas')
const { validate, validationError, validateId } = require("./middleware/Validation")
const { errorHandler, safeController } = require("./middleware/Errors")

/* Init Express */
const app = new express()

app.locals.basedir = ''

app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

const { connect: connectDb } = require('./config/Db')
const { connect: connectMq } = require('./config/Mq')

const boot = async () => {
  /* Initialize connections */
  await connectDb(process.env.DATABASE_URL, process.env.DATABASE_NAME)
  await connectMq(process.env.MQ_SERVER_URL)

  /* Swagger */
  const swaggerUI = require('swagger-ui-express')
  const swaggerDocument = require('./api-docs.json')

  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

  /* Initialize passport */
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

  /* Controllers */
  const initAccountControllers = require('./controllers/Account')
  const chatControllers = require('./controllers/Chat')
  const messageControllers = require('./controllers/Message')
  const userControllers = require('./controllers/User')

  /* Middlewares */
  const chatMiddleware = require('./middleware/Chat')
  const userMiddleware = require('./middleware/User')
  const accountMiddlewares = require('./middleware/Account')

  // activate the server
  app.listen(process.env.SERVER_PORT, () => { console.log(`Server listening at http://localhost:${process.env.SERVER_PORT}`) })

  /* ----- */
  /* CHATS */
  /* ----- */
  app.get('/api/chats/personal', authenticate, safeController(chatControllers.getChatsPersonal))
  app.get('/api/chats/:id', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), safeController(chatControllers.getChat))
  app.post('/api/chats', authenticate, validate({ body: schemas.chatCreateSchema }), safeController(chatControllers.createChat))
  app.put('/api/chats/:id', authenticate, validateId('id'), validate({ body: schemas.chatUpdateSchema }), chatMiddleware.isUserInChat('id', true), safeController(chatControllers.updateChat))
  app.delete('/api/chats/:id', authenticate, validateId('id'), chatMiddleware.isUserInChat('id', true), safeController(chatControllers.deleteChat))
  app.post('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), chatMiddleware.isUserInChat('id', true), safeController(chatControllers.addUser))
  app.put('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), validate({ body: schemas.chatUserUpdateSchema }), chatMiddleware.isUserInChat('id', true), safeController(chatControllers.updateUser))
  app.delete('/api/chats/:id/users/current', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), safeController(chatControllers.removeCurrentUser))
  app.delete('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), chatMiddleware.isUserInChat('id', true), safeController(chatControllers.removeUser))
  app.get('/api/chats/:id/users', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), safeController(chatControllers.getUsers))

  /* -------- */
  /* MESSAGES */
  /* -------- */
  app.get('/api/chats/:id/messages', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), safeController(messageControllers.getMessages))
  app.post('/api/chats/:id/messages', authenticate, validateId('id'), validate({ body: schemas.messageCreateSchema }), chatMiddleware.isUserInChat('id'), safeController(messageControllers.createMessage))
  app.get('/api/chats/:id/messages/:idm', authenticate, validateId('id'), validateId('idm'), chatMiddleware.isUserInChat('id'), safeController(messageControllers.getMessage))
  app.delete('/api/chats/:id/messages/:idm', authenticate, validateId('id'), validateId('idm'), chatMiddleware.isUserInChat('id'), safeController(messageControllers.deleteMessage))

  /* ----- */
  /* USERS */
  /* ----- */
  app.get('/api/users', safeController(userControllers.getUsers))
  app.get('/api/users/current', authenticate, safeController(userControllers.getCurrentUser))
  app.get('/api/users/:id', validateId('id'), safeController(userControllers.getUser))
  app.put('/api/users/:id', authenticate, validateId('id'), userMiddleware.isUserCurrent('id'), validate({ body: schemas.userUpdateSchema }), safeController(userControllers.updateUser))
  app.delete('/api/users/:id', validateId('id'), userControllers.deleteUser)

  /* ------------ */
  /* AUTHENTICATE */
  /* ------------ */
  const accountControllers = initAccountControllers(process.env.SECRET_OR_KEY, {
    httpOnly: true,
    secure: false, // when using https set it to true,
    sameSite: 'strict'
  })

  app.post('/api/authenticate/signup', validate({ body: schemas.userSignUpSchema }), accountMiddlewares.validateSingUp, safeController(accountControllers.signUp))
  app.post('/api/authenticate/signin', validate({ body: schemas.userSignInSchema }), safeController(accountControllers.signIn))
  app.post('/api/authenticate/logout', authenticate, safeController(accountControllers.logOut))

  if (process.env.GOOGLE_CLIENT_ID) {
    app.get('/api/authenticate/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
    app.get('/api/authenticate/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), safeController(accountControllers.providerCallback(process.env.GOOGLE_SUCCESS_REDIRECT_URL)))
  }

  app.use(validationError)
  app.use(errorHandler)
}

boot()