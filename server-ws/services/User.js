const axios = require('axios')
const cookieParser = require('cookie-parser')

require('dotenv').config()

const cookieParserMiddleware = cookieParser()

exports.getCurrentUser = function (req) {
    return new Promise((resolve, reject) => {
        try {
            cookieParserMiddleware(req, {}, () => {
                const cookies = req.cookies

                const activeURI = `http://${process.env.API_SERVER_URL}/api/users/current`

                axios.get(activeURI, {
                    headers: {
                        Cookie: `jwt=${cookies.jwt};`
                    }
                }).then(response => {
                    resolve(response.data)
                }).catch(err => {
                    reject({ status: err.response.status, message: err.response.statusText })
                })
            })
        } catch (err) {
            console.log(err)
        }
    })
}