import dotenv from 'dotenv'
import swaggerUI from 'swagger-ui-express'

import { createLogger, getLogger } from './src/utility/logger.ts'
import { isProd, isTest } from './src/utility/modes.ts'

dotenv.config()

createLogger(process.env.LOG_LEVEL as string, isTest(process.env.NODE_ENV as string))
const log = getLogger()

const boot = async () => {
	const { connect: connectDb } = await import('./src/config/db.ts')
	const { connect: connectMq } = await import('./src/config/mq.ts')

	const { default: app } = await import('./app.ts')

	/* Initialize connections */
	await connectDb(process.env.DATABASE_URL as string, process.env.DATABASE_NAME as string)
	await connectMq(process.env.MQ_SERVER_URL as string)

	/* Swagger */
	if (!isProd(process.env.NODE_ENV as string)) {
		const SwaggerParserModule = await import('@apidevtools/swagger-parser')
		const SwaggerParser = SwaggerParserModule.default || SwaggerParserModule
		const bundledSpec = await SwaggerParser.bundle('./api-docs.json')

		app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(bundledSpec))
	}

	app.listen(process.env.SERVER_PORT, () => { log?.info(`Server listening at port ${process.env.SERVER_PORT}`) })
}

boot()