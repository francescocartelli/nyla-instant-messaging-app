import winston from 'winston'

let logger = null

export const createLogger = (level, silent = false) => {
    logger = winston.createLogger({
        level,
        silent,
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, message }) => `${timestamp} | ${message}`)
        ),
        transports: [
            new winston.transports.Console()
        ]
    })

    return logger
}

export const getLogger = () => logger