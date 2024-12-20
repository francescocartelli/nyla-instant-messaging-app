const winston = require('winston')

const createLogger = level => winston.createLogger({
    level,
    format: winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.printf(({ timestamp, message }) => `${timestamp} | ${message}`)
    ),
    transports: [
        new winston.transports.Console()
    ]
})

module.exports = createLogger