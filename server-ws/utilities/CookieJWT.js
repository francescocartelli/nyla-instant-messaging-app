export const jwtTCookieHeader = jwt => ({
    Cookie: `jwt=${jwt};`
})