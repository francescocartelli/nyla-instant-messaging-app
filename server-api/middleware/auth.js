const usersServices = require.main.require('./services/User')
const { getDate } = require.main.require('./components/utils')

exports.verifyJwtPayload = (payload) => {
    return new Promise((resolve, reject) => {
        usersServices.getUser({ id: payload.sub }).then(user => {
            if (user) {
                if (getDate() < payload.exp) resolve(user)
                else resolve(false)
            } else resolve(false)
        }).catch(err => reject(err))
    })
}