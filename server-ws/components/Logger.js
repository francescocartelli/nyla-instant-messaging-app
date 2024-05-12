const winston = require('winston')

require('dotenv').config()

exports.logger = winston.createLogger({
    level: process.env.LOGGING_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.printf(({ timestamp, message }) => `${timestamp} | ${message}`)
    ),
    transports: [
        new winston.transports.Console()
    ]
})