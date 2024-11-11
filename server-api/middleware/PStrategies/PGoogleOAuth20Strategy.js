const GoogleStrategy = require('passport-google-oauth20')

const { USERNAME_TAKEN, IDENTITY_NO_EMAIL } = require("../../components/ResponseMessages")
const { newUser } = require("../../components/User")

const usersServices = require("../../services/User")

const generateUsername = (name, { maxLength = 20, suffixLength = 5 } = {}) => name.replace(/[^a-zA-Z0-9]/g, '').substring(0, maxLength - suffixLength)
const generateUsernameUUID = ({ usernameUUIDLength = 4 } = {}) => Math.random().toString(36).slice(-usernameUUIDLength)

const isUsernameTaken = async username => Boolean(await usersServices.getUser({ username }))

const generateUniqueUsername = async displayName => {
    let username = generateUsername(displayName)
    if (!(await isUsernameTaken(username))) return username

    username = `${username}_${generateUsernameUUID()}`
    if (await isUsernameTaken(username)) throw new Error(USERNAME_TAKEN)

    return username
}

const getValidEmail = emails => {
    const email = emails[0]
    if (!email) throw new Error(IDENTITY_NO_EMAIL)

    return { email: email.value, confirmed: email.verified }
}

const register = async ({ displayName, ...user }) => {
    const username = await generateUniqueUsername(displayName)
    const { insertedId } = await usersServices.createUser(newUser({ username, ...user }))

    return { id: insertedId, username, email: user.email }
}

const verify = async ({ displayName, emails, provider }) => {
    const { email, confirmed } = getValidEmail(emails)

    const user = await usersServices.getUser({ email })
    if (user) return user // user already registered

    const regUser = await register({ displayName, email, confirmed, provider })
    return regUser
}

exports.useGoogleStrategy = configs => new GoogleStrategy(configs,
    (access, refresh, profile, done) => verify(profile)
        .then(user => done(null, user))
        .catch(err => done(err, false))
)