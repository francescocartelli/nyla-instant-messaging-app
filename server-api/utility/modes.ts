const DEVELOPMENT = 'development'
const PRODUCTION = 'production'
const TEST = 'test'

const modes = [
    DEVELOPMENT,
    PRODUCTION,
    TEST
]

const modesSet = new Set(modes)

export const validate = (mode: string): string => {
    if (!modesSet.has(mode)) throw new Error(`Unrecognized env mode: ${mode}`)

    return mode
}

export const isDev = (mode: string): boolean => mode === DEVELOPMENT
export const isProd = (mode: string): boolean => mode === PRODUCTION
export const isTest = (mode: string): boolean => mode === TEST