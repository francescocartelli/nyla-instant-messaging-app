const createLogger = require("./Logger")

const logger = createLogger(process.env.LOGGING_LEVEL)

const invokeFetch = async (url, { method, ...props }) => {
    try {
        const startTime = performance.now()

        const response = await fetch(url, { method, ...props })

        const endTime = performance.now()

        logger.info(`${method} ${url} ${response.status} ${(endTime - startTime).toFixed(3)} ms`)

        return response
    } catch (err) {
        logger.error(err)

        return null
    }
}

exports.invokeFetch = invokeFetch