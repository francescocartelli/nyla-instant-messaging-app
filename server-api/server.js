'use strict'

const express = require('express')
const morgan = require('morgan')

require('dotenv').config()

/* Init Express */
const app = new express()

app.locals.basedir = ''

app.use(morgan('dev'))
app.use(express.json())

// activate the server
app.listen(process.env.SERVER_PORT, () => { console.log(`Server listening at http://localhost:${process.env.SERVER_PORT}`) })
