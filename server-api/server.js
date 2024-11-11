'use strict'

const express = require('express')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

require('dotenv').config()

/* Validator middleware */
const { schemas, validate, validationError, validateId } = require("./middleware/Validation")
const { errorHandler } = require("./middleware/Errors")

/* Init Express */
const app = new express()

app.locals.basedir = ''

app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

const { connect: connectDb } = require('./components/Db')
const { connect: connectMq } = require('./components/Redis')

const boot = async () => {
  /* Initialize connections */
  await connectDb(process.env.DATABASE_URL, process.env.DATABASE_NAME)
  await connectMq(process.env.MQ_SERVER_URL)

  /* Swagger */
  const swaggerUI = require('swagger-ui-express')
  const swaggerDocument = require('./api-docs.json')

  // swagger documentation
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
  app.get('/api/chats/personal', authenticate, chatControllers.getChatsPersonal)
  app.get('/api/chats/:id', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), chatControllers.getChat)
  app.post('/api/chats', authenticate, validate({ body: schemas.chatCreateSchema }), chatControllers.createChat)
  app.put('/api/chats/:id', authenticate, validateId('id'), validate({ body: schemas.chatUpdateSchema }), chatMiddleware.isUserInChat('id', true), chatControllers.updateChat)
  app.delete('/api/chats/:id', authenticate, validateId('id'), chatMiddleware.isUserInChat('id', true), chatControllers.deleteChat)
  app.post('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), chatMiddleware.isUserInChat('id', true), chatControllers.addUser)
  app.put('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), validate({ body: schemas.chatUserUpdateSchema }), chatMiddleware.isUserInChat('id', true), chatControllers.updateUser)
  app.delete('/api/chats/:id/users/current', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), chatControllers.removeCurrentUser)
  app.delete('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), chatMiddleware.isUserInChat('id', true), chatControllers.removeUser)
  app.get('/api/chats/:id/users', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), chatControllers.getUsers)

  /* -------- */
  /* MESSAGES */
  /* -------- */
  app.get('/api/chats/:id/messages', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), messageControllers.getMessages)
  app.post('/api/chats/:id/messages', authenticate, validateId('id'), validate({ body: schemas.messageCreateSchema }), chatMiddleware.isUserInChat('id'), messageControllers.createMessage)
  app.get('/api/chats/:id/messages/:idm', authenticate, validateId('id'), validateId('idm'), chatMiddleware.isUserInChat('id'), messageControllers.getMessage)
  app.delete('/api/chats/:id/messages/:idm', authenticate, validateId('id'), validateId('idm'), chatMiddleware.isUserInChat('id'), messageControllers.deleteMessage)

  /* ----- */
  /* USERS */
  /* ----- */
  app.get('/api/users', userControllers.getUsers)
  app.get('/api/users/current', authenticate, userControllers.getCurrentUser)
  app.get('/api/users/:id', validateId('id'), userControllers.getUser)
  app.put('/api/users/:id', authenticate, validateId('id'), userMiddleware.isUserCurrent('id'), validate({ body: schemas.userUpdateSchema }), userControllers.updateUser)
  app.delete('/api/users/:id', validateId('id'), userControllers.deleteUser)

  /* ------------ */
  /* AUTHENTICATE */
  /* ------------ */
  const accountControllers = initAccountControllers(process.env.SECRET_OR_KEY, {
    httpOnly: true,
    secure: false, // when using https set it to true,
    sameSite: 'strict'
  })

  app.post('/api/authenticate/signup', validate({ body: schemas.userSignUpSchema }), accountMiddlewares.validateSingUp, accountControllers.signUp)
  app.post('/api/authenticate/signin', validate({ body: schemas.userSignInSchema }), accountControllers.signIn)
  app.post('/api/authenticate/logout', authenticate, accountControllers.logOut)

  if (process.env.GOOGLE_CLIENT_ID) {
    app.get('/api/authenticate/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
    app.get('/api/authenticate/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), accountControllers.providerCallback(process.env.GOOGLE_SUCCESS_REDIRECT_URL))
  }

  app.use(validationError)
  app.use(errorHandler)
}

boot()