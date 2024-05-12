const { ObjectId } = require("mongodb")

module.exports.getDate = () => {
    return Math.floor(Date.now()/1000)
}

module.exports.day = (n=1) => {
    return n*(60*60*24)
}

exports.cookieExtractor = (req) => {
    return (req && req.cookies) ? req.cookies['jwt'] : null
}

exports.getCursor = (c) => {
    return ObjectId.isValid(c) ? c : undefined
}

exports.getBool = (b) => {
    if (b === undefined || b === null || b === 'null') return null
    else return b.toLowerCase?.() === 'true'
}