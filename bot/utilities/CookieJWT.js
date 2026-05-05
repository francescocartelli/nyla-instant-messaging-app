const extractResponseCookie = res => {
    const cookies = res.headers.getSetCookie()
    const jwt = cookies[0]?.split(';')[0].split('=')[1]

    return jwt
}

const jwtTCookieHeader = jwt => ({
    Cookie: `jwt=${jwt};`
})

exports.extractResponseCookie = extractResponseCookie
exports.jwtTCookieHeader = jwtTCookieHeader