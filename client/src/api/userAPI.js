async function getUsers(username = "") {
    const response = await fetch(`/api/users?username=${username}`)
    return response.json()
}

async function signin(username, password) {
    const response = await fetch('/api/authenticate/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    })

    const res = await response.json()

    if (response.ok) return res
    else throw new Error(res.message)
}

async function signup(username, password, email) {
    const response = await fetch('/api/authenticate/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password, email: email })
    })

    const res = await response.json()

    if (response.ok) return res
    else throw new Error(res.message)
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