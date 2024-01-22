const winston = require('winston')

exports.logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.printf(({ timestamp, message }) => `${timestamp} | ${message}`)
    ),
    transports: [
        new winston.transports.Console()
    ]
})