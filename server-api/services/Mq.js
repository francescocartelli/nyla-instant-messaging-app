const { publish } = require("../config/Mq")
const { mqCreateMessage, mqUpdateMessage, mqDeleteMessage, mqDeleteChat } = require("../model/Mq")

const createMessageBroadcast = message => recipient => publish(`user:${recipient}`, message)
const broadcastMessage = (recipients, message) => Promise.all(recipients.map(createMessageBroadcast(message)))

const createMqBroadcast = messageModel => (recipients, message) => broadcastMessage(recipients, JSON.stringify(messageModel(message)))

exports.createMessage = createMqBroadcast(mqCreateMessage)
exports.updateMessage = createMqBroadcast(mqUpdateMessage)
exports.deleteMessage = createMqBroadcast(mqDeleteMessage)

exports.deleteChat = createMqBroadcast(mqDeleteChat)
