import dotenv from 'dotenv'
import swaggerUI from 'swagger-ui-express'

import { createLogger, getLogger } from './utility/logger.js'
import { isProd, isTest } from './utility/modes.js'

dotenv.config()

createLogger(process.env.LOG_LEVEL, isTest(process.env.NODE_ENV))
const log = getLogger()

const boot = async () => {
	const { connect: connectDb } = await import('./config/Db.js')
	const { connect: connectMq } = await import('./config/Mq.js')

	const { default: app } = await import('./app.js')

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

	app.listen(process.env.SERVER_PORT, () => { log.info(`Server listening at port ${process.env.SERVER_PORT}`) })
}

boot()