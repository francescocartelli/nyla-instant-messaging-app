const app = require('./app')

const swaggerUI = require('swagger-ui-express')

const { connect: connectDb } = require('./config/Db')
const { connect: connectMq } = require('./config/Mq')

const { isProd } = require('./utility/modes')

require('dotenv').config()

const boot = async () => {
  /* Initialize connections */
  await connectDb(process.env.DATABASE_URL, process.env.DATABASE_NAME)
  await connectMq(process.env.MQ_SERVER_URL)

  /* Swagger */
  if (!isProd(process.env.NODE_ENV)) {
    const SwaggerParserModule = await import('@apidevtools/swagger-parser')
    const SwaggerParser = SwaggerParserModule.default || SwaggerParserModule
    const bundledSpec = await SwaggerParser.bundle('./api-docs.json')

    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(bundledSpec))
  }

  app.listen(process.env.SERVER_PORT, () => { console.log(`Server listening at http://localhost:${process.env.SERVER_PORT}`) })
}

boot()