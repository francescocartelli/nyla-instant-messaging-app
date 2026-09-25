import morgan from "morgan"

const logLevels = {
    development: 'dev',
    production: 'combined'
}

export const logger = mode => morgan(logLevels[mode] || 'dev')