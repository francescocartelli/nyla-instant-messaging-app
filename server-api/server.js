const app = require('./app')

const { connect: connectDb } = require('./config/Db')
const { connect: connectMq } = require('./config/Mq')

require('dotenv').config()

const boot = async () => {
  /* Initialize connections */
  await connectDb(process.env.DATABASE_URL, process.env.DATABASE_NAME)
  await connectMq(process.env.MQ_SERVER_URL)

  app.listen(process.env.SERVER_PORT, () => { console.log(`Server listening at http://localhost:${process.env.SERVER_PORT}`) })
}

boot()