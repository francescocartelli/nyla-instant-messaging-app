import { currentUserEndpoint, googleAuthenticateEndpoint, logoutEndpoint, searchUsersEndpoint, signinEndpoint, signupEndpoint, userEndpoint } from './endpoints'
import { postConfigJSON, putConfigJSON, safeFetch } from './utils'

const getUsers = (username = "", searchType = "contains", options = {}) => safeFetch(searchUsersEndpoint(username, searchType), options)

const signin = (userIdentifier, password) => safeFetch(signinEndpoint(), postConfigJSON({ userIdentifier, password }))
const signup = (username, password, email) => safeFetch(signupEndpoint(), postConfigJSON({ username, password, email }))

const getCurrentUser = () => safeFetch(currentUserEndpoint())

const logout = () => safeFetch(logoutEndpoint(), postConfigJSON())

const updateUser = (id, { bio = null, username = null }) => safeFetch(userEndpoint(id), putConfigJSON({
    ...(bio !== null ? { bio } : {}),
    ...(username !== null ? { username } : {})
}))

const authGoogle = () => safeFetch(googleAuthenticateEndpoint())

const userAPI = { getUsers, signin, signup, getCurrentUser, logout, updateUser, authGoogle }

export default userAPI