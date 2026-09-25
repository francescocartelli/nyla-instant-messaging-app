import { Strategy as GoogleStrategy, Profile, StrategyOptions } from 'passport-google-oauth20'

import { IDENTITY_NO_EMAIL, USERNAME_TAKEN } from "../../constants/ResponseMessages.ts"

import usersServices from "../../services/User.ts"

const generateUsername = (name: string, { maxLength = 20, suffixLength = 5 } = {}) => name.replace(/[^a-zA-Z0-9]/g, '').substring(0, maxLength - suffixLength)
const generateUsernameUUID = ({ usernameUUIDLength = 4 } = {}) => Math.random().toString(36).slice(-usernameUUIDLength)

const isUsernameTaken = async (username: string) => Boolean(await usersServices.getUser({ username }))

const generateUniqueUsername = async (displayName: string) => {
    let username = generateUsername(displayName)
    if (!(await isUsernameTaken(username))) return username

    username = `${username}_${generateUsernameUUID()}`
    if (await isUsernameTaken(username)) throw new Error(USERNAME_TAKEN)

    return username
}

type Email = {
    value: string
    verified: boolean
}

const getValidEmail = (emails: Array<Email> | undefined) => {
    const email = emails?.[0]
    if (!email) throw new Error(IDENTITY_NO_EMAIL)

    return { email: email.value, confirmed: email.verified }
}

interface RegisterProps {
    displayName: string
    email: string
    confirmed: boolean
    provider: string
}

const register = async ({ displayName, ...user }: RegisterProps) => {
    const username = await generateUniqueUsername(displayName)
    const { insertedId } = await usersServices.createUser({ username, ...user })

    return {
        id: insertedId,
        confirmed: true,
        bio: '',
        username,
        email: user.email
    }
}

const verify = async ({ displayName, emails, provider }: Profile) => {
    const { email, confirmed } = getValidEmail(emails)

    const user = await usersServices.getUser({ email })
    if (user) return user // user already registered

    const regUser = await register({ displayName, email, confirmed, provider })
    return regUser
}

export const useGoogleStrategy = (configs: StrategyOptions) => new GoogleStrategy(configs,
    (access, refresh, profile, done) => verify(profile)
        .then(user => done(null, user))
        .catch(err => done(err, false))
)