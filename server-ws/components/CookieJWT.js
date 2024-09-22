const getCookieJWT = (jwt) => ({
    headers: {
        Cookie: `jwt=${jwt};`
    }
})

exports.getCookieJWT = getCookieJWT