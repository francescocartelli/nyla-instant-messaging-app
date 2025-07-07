const jwtTCookieHeader = jwt => ({
    Cookie: `jwt=${jwt};`
})

exports.jwtTCookieHeader = jwtTCookieHeader