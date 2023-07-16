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

  require('./middleware/strategy')

  /* Controllers */
  const userController = require('./controllers/User')
  const accountController = require('./controllers/Account')

  /* Middlewares */
  const userMiddleware = require('./middleware/User')

  // activate the server
  app.listen(process.env.SERVER_PORT, () => { console.log(`Server listening at http://localhost:${process.env.SERVER_PORT}`) })

  /* ----- */
  /* USERS */
  /* ----- */
  app.get('/api/users', userController.getUsers)
  app.get('/api/users/current', passport.authenticate('jwt', { session: false }), userController.getCurrentUser)
  app.get('/api/users/:id', validateId('id'), userController.getUser)
  app.put('/api/users/:id', passport.authenticate('jwt', { session: false }), validateId('id'), userMiddleware.isUserCurrent('id'), validate({ body: schemas.userUpdateSchema }), userController.updateUser)
  app.delete('/api/users/:id', validateId('id'), userController.deleteUser)

  /* ------------ */
  /* AUTHENTICATE */
  /* ------------ */
  app.post('/api/authenticate/signup', validate({ body: schemas.userSignUpSchema }), accountController.signUp)
  app.post('/api/authenticate/signin', validate({ body: schemas.userSignInSchema }), accountController.singIn)
  app.post('/api/authenticate/logout', passport.authenticate('jwt', { session: false }), accountController.logOut)

  // Error handlers for validation
  app.use(validationError)
}