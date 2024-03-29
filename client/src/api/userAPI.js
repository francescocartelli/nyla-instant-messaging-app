async function getUsers(username = "", searchType = "contains", options = {}) {
    const response = await fetch(`/api/users?username=${username}&searchType=${searchType}`, options)
    return response.json()
}

async function signin(username, password) {
    const response = await fetch('/api/authenticate/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    })

    if (!response.ok) {
        let error = null
        try {
            error = await response.json()
        } catch (err) {
            /* JSON parsing error, continue with default errorMessage */
            throw new Error(response.statusText)
        }
        throw new Error(error.message)
    }

    return response.json()
}

async function signup(username, password, email) {
    const response = await fetch('/api/authenticate/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password, email: email })
    })

    if (!response.ok) {
        let error = null
        console.log(response)
        try {
            error = await response.json()
        } catch (err) {
            /* JSON parsing error, continue with default errorMessage */
            console.log('weewewwe')
            throw new Error(response.statusText)
        }
        throw new Error(error.message)
    }

    return response.json()
}

async function getCurrentUser() {
    const response = await fetch('/api/users/current')

    return response.json()
}

function logout() {
    return fetch('/api/authenticate/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
}

function updateUser(id, { bio = null, username = null }) {
    return fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...(bio !== null ? { bio } : {}),
            ...(username !== null ? { username } : {})
        })
    })
}

const userAPI = { getUsers, signin, signup, getCurrentUser, logout, updateUser }

export default userAPI