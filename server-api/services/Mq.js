import { publish } from "../config/Mq.js"

import { mqCreateMessage, mqDeleteChat, mqDeleteMessage, mqUpdateMessage } from "../model/Mq.js"

const createMessageBroadcast = message => recipient => publish(`user:${recipient}`, message)
const broadcastMessage = (recipients, message) => Promise.all(recipients.map(createMessageBroadcast(message)))

const createMqBroadcast = messageModel => (recipients, message) => broadcastMessage(recipients, JSON.stringify(messageModel(message)))

export const createMessage = createMqBroadcast(mqCreateMessage)
export const updateMessage = createMqBroadcast(mqUpdateMessage)
export const deleteMessage = createMqBroadcast(mqDeleteMessage)

export const deleteChat = createMqBroadcast(mqDeleteChat)