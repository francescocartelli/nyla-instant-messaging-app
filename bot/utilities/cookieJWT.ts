export const extractResponseCookie = res => {
    const cookies = res.headers.getSetCookie()
    const jwt = cookies[0]?.split(';')[0].split('=')[1]

    return jwt
}

export const jwtTCookieHeader = jwt => ({
    Cookie: `jwt=${jwt};`
})