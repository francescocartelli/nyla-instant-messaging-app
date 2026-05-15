const DEVELOPMENT = 'development'
const PRODUCTION = 'production'
const TEST = 'test'

const modes = [
    DEVELOPMENT,
    PRODUCTION,
    TEST
]

const modesSet = new Set(modes)

exports.validate = mode => {
    if (!modesSet.has(mode)) throw new Error(`Unrecognized env mode: ${mode}`)

    return mode
}

exports.isDev = mode => mode === DEVELOPMENT
exports.isProd = mode => mode === PRODUCTION
exports.isTest = mode => mode === TEST


