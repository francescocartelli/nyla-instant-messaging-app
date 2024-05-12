const getCookieJWT = (jwt) => {
    return {
        headers: {
            Cookie: `jwt=${jwt};`
        }
    }
}

exports.getCookieJWT = getCookieJWT