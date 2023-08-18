async function getUsers(username = "", options={}) {
    const response = await fetch(`/api/users?username=${username}`, options)
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
    try {
        const response = await fetch('/api/authenticate/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password, email: email })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message)
        }

        return response.json()
    } catch (err) {
        console.log("weeee")
        console.log(err)
    }
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

const userAPI = { getUsers, signin, signup, getCurrentUser, logout }

export default userAPI