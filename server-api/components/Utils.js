const { isOidValid } = require.main.require("./components/Db")

module.exports.getDate = () => {
    return Math.floor(Date.now() / 1000)
}

module.exports.day = (n = 1) => {
    return n * (60 * 60 * 24)
}

exports.parseCursor = (c) => {
    return isOidValid(c) ? c : undefined
}

exports.parseBool = (b) => {
    if (b === undefined || b === null || b === 'null') return null
    else return b.toLowerCase?.() === 'true'
}