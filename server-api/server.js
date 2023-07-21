'use strict'

const express = require('express')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

require('dotenv').config()

/* Validator middleware */
const { schemas, validate, validationError, validateId } = require("./middleware/validation")

/* Init Express */
const app = new express()

app.locals.basedir = ''

app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

/* Initialize Mongodb */
const db = require('./components/db')
db.connect(() => {
  boot()
})

function boot() {
  /* Initialize passport */
  const passport = require('passport')
  app.use(passport.initialize())

  const authenticate = passport.authenticate('jwt', { session: false })

  require('./middleware/strategy')

  /* Controllers */
  const accountControllers = require('./controllers/Account')
  const chatControllers = require('./controllers/Chat')
  const messageControllers = require('./controllers/Message')
  const userControllers = require('./controllers/User')

  /* Middlewares */
  const chatMiddleware = require('./middleware/Chat')
  const userMiddleware = require('./middleware/User')

  // activate the server
  app.listen(process.env.SERVER_PORT, () => { console.log(`Server listening at http://localhost:${process.env.SERVER_PORT}`) })

  /* ----- */
  /* CHATS */
  /* ----- */
  app.get('/api/chats/personal', authenticate, chatControllers.getChatsPersonal)
  app.get('/api/chats/:id', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), chatControllers.getChat)
  app.post('/api/chats', authenticate, validate({ body: schemas.chatCreateSchema }), chatControllers.createChat)
  app.put('/api/chats/:id', authenticate, validateId('id'), validate({ body: schemas.chatUpdateSchema }), chatMiddleware.isUserInChat('id'), chatControllers.updateChat)
  app.delete('/api/chats/:id', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'))
  app.put('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), chatMiddleware.isUserInChat('id'), chatControllers.addUser)
  app.delete('/api/chats/:id/users/:idu', authenticate, validateId('id'), validateId('idu'), chatMiddleware.isUserInChat('id'), chatControllers.removeUser)
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
  app.post('/api/authenticate/signup', validate({ body: schemas.userSignUpSchema }), accountControllers.signUp)
  app.post('/api/authenticate/signin', validate({ body: schemas.userSignInSchema }), accountControllers.singIn)
  app.post('/api/authenticate/logout', authenticate, accountControllers.logOut)

  // Error handlers for validation
  app.use(validationError)
}