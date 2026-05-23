const morgan = require("morgan")

const logLevels = {
    development: 'dev',
    production: 'combined'
}

const logger = mode => morgan(logLevels[mode] || 'dev')

exports.logger = logger