const { publish } = require("../components/Redis")

const createMessageBroadcast = message => user => publish(`user:${user}`, message)

exports.broadcastMessage = (users, message) => Promise.all(users.map(createMessageBroadcast(message)))