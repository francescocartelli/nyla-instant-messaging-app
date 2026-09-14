import bcrypt from 'bcrypt'

const jwtCode = 'jwt'
const saltOrRounds = 10

const getDate = () => Math.floor(Date.now() / 1000)
const day = (n = 1) => n * (60 * 60 * 24)

const getHash = password => bcrypt.hash(password, saltOrRounds)
const compare = bcrypt.compare

const tokenPayload = sub => ({
    sub,
    iat: getDate(),
    exp: getDate() + day()
})

const cookieExtractor = req => (req && req.cookies) ? req.cookies[jwtCode] : null
const verifyPayload = ({ exp }) => getDate() < exp

export default {
    getHash,
    compare,
    tokenPayload,
    cookieExtractor,
    verifyPayload
}