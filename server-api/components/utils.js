module.exports.getDate = function () {
    return Math.floor(Date.now()/1000)
}

module.exports.day = function (n=1) {
    return n*(60*60*24)
}

exports.cookieExtractor = (req) => {
    return (req && req.cookies) ? req.cookies['jwt'] : null
}

exports.getPage = (p) => {
    const page = parseInt(p)
    if (page < 0) throw new Error("Page number has to be equal or higher than zero")
    return page === NaN ? 0 : page
}