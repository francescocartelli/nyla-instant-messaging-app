export const jwtTCookieHeader = (jwt: string) => ({
    Cookie: `jwt=${jwt};`
})