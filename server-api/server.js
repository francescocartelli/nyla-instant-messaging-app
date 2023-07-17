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
  const accountController = require('./controllers/Account')
  const chatController = require('./controllers/Chat')
  const userController = require('./controllers/User')

  /* Middlewares */
  const chatMiddleware = require('./middleware/Chat')
  const userMiddleware = require('./middleware/User')

  // activate the server
  app.listen(process.env.SERVER_PORT, () => { console.log(`Server listening at http://localhost:${process.env.SERVER_PORT}`) })

  /* ----- */
  /* CHATS */
  /* ----- */
  app.get('/api/chats/personal', authenticate, chatController.getChatsPersonal)
  app.get('/api/chats/:id', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), chatController.getChat)
  app.post('/api/chats', authenticate, validate({ body: schemas.chatCreateSchema }), chatController.createChat)
  app.get('/api/chats/:id/users', authenticate, validateId('id'), chatMiddleware.isUserInChat('id'), chatController.getUsers)

  /* ----- */
  /* USERS */
  /* ----- */
  app.get('/api/users', userController.getUsers)
  app.get('/api/users/current', authenticate, userController.getCurrentUser)
  app.get('/api/users/:id', validateId('id'), userController.getUser)
  app.put('/api/users/:id', authenticate, validateId('id'), userMiddleware.isUserCurrent('id'), validate({ body: schemas.userUpdateSchema }), userController.updateUser)
  app.delete('/api/users/:id', validateId('id'), userController.deleteUser)

  /* ------------ */
  /* AUTHENTICATE */
  /* ------------ */
  app.post('/api/authenticate/signup', validate({ body: schemas.userSignUpSchema }), accountController.signUp)
  app.post('/api/authenticate/signin', validate({ body: schemas.userSignInSchema }), accountController.singIn)
  app.post('/api/authenticate/logout', authenticate, accountController.logOut)

  // Error handlers for validation
  app.use(validationError)
}