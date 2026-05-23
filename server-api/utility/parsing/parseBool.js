const translations = {
    'true': true,
    'false': false,
    '1': true,
    '0': false
}

const parseBool = (input, { strict = false } = {}) => {
    const value = translations[input?.toString?.().toLowerCase?.()]

    if (strict && value === undefined) {
        throw new TypeError(`Cannot parse boolean from: ${input}`)
    }

    return value
}

module.exports = parseBool