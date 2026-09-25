import morgan from "morgan"

const logLevels: Record<string, string> = {
    development: 'dev',
    production: 'combined'
}

export const logger = (mode: string) => morgan(logLevels[mode] || 'dev')