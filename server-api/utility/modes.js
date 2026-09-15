const DEVELOPMENT = 'development'
const PRODUCTION = 'production'
const TEST = 'test'

const modes = [
    DEVELOPMENT,
    PRODUCTION,
    TEST
]

const modesSet = new Set(modes)

export const validate = mode => {
    if (!modesSet.has(mode)) throw new Error(`Unrecognized env mode: ${mode}`)

    return mode
}

export const isDev = mode => mode === DEVELOPMENT
export const isProd = mode => mode === PRODUCTION
export const isTest = mode => mode === TEST