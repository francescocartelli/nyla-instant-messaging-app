const bcrypt = require('bcrypt')

require('dotenv').config()

exports.getHash = password => bcrypt.hash(password, parseInt(process.env.SALT_OR_ROUNDS))
exports.compare = bcrypt.compare