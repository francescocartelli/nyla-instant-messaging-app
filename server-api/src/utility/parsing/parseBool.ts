const translations: Record<string, boolean> = {
    'true': true,
    'false': false,
    '1': true,
    '0': false
}

const parseBool = (input: string, { strict = false } = {}): boolean | undefined => {
    const value = translations[input?.toString?.().toLowerCase?.()]

    if (strict && value === undefined) {
        throw new TypeError(`Cannot parse boolean from: ${input}`)
    }

    return value
}

export default parseBool