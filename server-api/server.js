'use strict'

const express = require('express')
const morgan = require('morgan')

require('dotenv').config()

/* Validator middleware */
const { validateId } = require("./middleware/validation")

/* Init Express */
const app = new express()

app.locals.basedir = ''

app.use(morgan('dev'))
app.use(express.json())

/* Initialize Mongodb */
const db = require('./components/db')

db.connect(() => {
  boot()
})

function boot() {
  /* Controllers */
  const userController = require('./controllers/User')

  // activate the server
  app.listen(process.env.SERVER_PORT, () => { console.log(`Server listening at http://localhost:${process.env.SERVER_PORT}`) })

  /* ----- */
  /* USERS */
  /* ----- */
  app.get('/api/users', userController.getUsers)
  app.get('/api/users/:id', validateId('id'), userController.getUser)
}