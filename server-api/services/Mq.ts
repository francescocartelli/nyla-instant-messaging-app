import { publish } from "../config/Mq.ts"

import { mqCreateMessage, mqDeleteChat, mqDeleteMessage, MqMessage, MqMessageInput, mqUpdateMessage } from "../model/Mq.ts"

type MessageModel<T> = (message: T) => MqMessage

type Recipient = string

const createMessageBroadcast = (message: string) => (recipient: Recipient) => publish(`user:${recipient}`, message)
const broadcastMessage = (recipients: Array<Recipient>, message: string) => Promise.all(recipients.map(createMessageBroadcast(message)))

const createMqBroadcast = <T>(messageModel: MessageModel<T>) => (recipients: Array<Recipient>, message: T) => broadcastMessage(recipients, JSON.stringify(messageModel(message)))

export const createMessage = createMqBroadcast<MqMessageInput>(mqCreateMessage)
export const updateMessage = createMqBroadcast<MqMessageInput>(mqUpdateMessage)
export const deleteMessage = createMqBroadcast<MqMessageInput>(mqDeleteMessage)

export const deleteChat = createMqBroadcast(mqDeleteChat)