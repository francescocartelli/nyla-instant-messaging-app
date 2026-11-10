import { extractResponseCookie } from '../utilities/cookieJWT.ts'
import { invokeFetch } from '../utilities/network.ts'

interface SignInBot {
    username: string
    password: string
}

interface SignUpBot {
    username: string
    password: string
    email: string
}

interface SignBot extends SignUpBot {

}

const signInBot = ({ username, password }: SignInBot) => invokeFetch(`${process.env.API_SERVER_URL}/api/authenticate/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIdentifier: username, password })
})

const signUpBot = async ({ username, password, email }: SignUpBot) => invokeFetch(`${process.env.API_SERVER_URL}/api/authenticate/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email })
})

export const signBot = async ({ username, password, email }: SignBot) => {
    // try signin
    let res = await signInBot({ username, password })

    // if not ok try signup
    if (!res || !res.ok) res = await signUpBot({ username, password, email })

    if (!res || !res.ok) throw Error('Error during signup')

    const user = await res.json()
    const jwt = extractResponseCookie(res)

    return { user, jwt }
}