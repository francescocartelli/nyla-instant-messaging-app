const jwtTCookieHeader = jwt => ({
    headers: {
        Cookie: `jwt=${jwt};`
    }
})

exports.jwtTCookieHeader = jwtTCookieHeader