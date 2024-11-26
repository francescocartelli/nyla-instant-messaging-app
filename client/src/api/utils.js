import { contentTypeJSON } from './configs'

const JSONBody = body => ({
    headers: contentTypeJSON,
    ...(body !== null && body !== undefined && { body: JSON.stringify(body) })
})

const postConfigJSON = body => ({ method: 'POST', ...JSONBody(body) })
const putConfigJSON = body => ({ method: 'PUT', ...JSONBody(body) })
const deleteConfig = () => ({ method: 'DELETE' })

const safeFetch = (...args) => new Promise((resolve, reject) => {
    fetch(...args)
        .then(res => res.ok ? resolve(res) : reject(res))
        .catch(err => reject(err))
})

export { postConfigJSON, putConfigJSON, deleteConfig, safeFetch }