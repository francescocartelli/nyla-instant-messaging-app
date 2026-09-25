import { Message } from "./Message.ts"

type MessageType = 'MESSAGE_CREATE' | 'MESSAGE_UPDATE' | 'MESSAGE_DELETE' | 'CHAT_DELETE'

export type MqMessageInput = Message & {
    chatName: string
    senderUsername: string
}

export interface MqMessage {
    type: MessageType
    chat: string
    message?: Pick<Message,
        'id' |
        'content'
    > & {
        idChat: string,
        chatName: string
        idSender: string
        senderUsername: string
        createdAt?: Date | null
        updatedAt?: Date | null
        deletedAt?: Date | null
    }
}

export const mqCreateMessage = ({ id, sender, chat, content, chatName, senderUsername, repliedTo }: MqMessageInput): MqMessage => ({
    type: 'MESSAGE_CREATE',
    chat: chat.toString(),
    message: {
        id,
        idChat: chat.toString(),
        chatName,
        idSender: sender.toString(),
        senderUsername,
        content,
        ...(repliedTo ? {
            repliedTo: {
                id: repliedTo.id.toString(),
                idSender: repliedTo.idSender.toString(),
                content: repliedTo.content,
                createdAt: repliedTo.createdAt
            }
        } : {})
    }
})

export const mqUpdateMessage = ({ id, sender, chat, content, chatName, senderUsername, createdAt, updatedAt }: MqMessageInput): MqMessage => ({
    type: 'MESSAGE_UPDATE',
    chat: chat.toString(),
    message: {
        id: id,
        idSender: sender.toString(),
        idChat: chat.toString(),
        chatName,
        senderUsername,
        content,
        createdAt,
        updatedAt
    }
})

export const mqDeleteMessage = ({ id, sender, chat, content, chatName, senderUsername, deletedAt }: MqMessageInput): MqMessage => ({
    type: 'MESSAGE_DELETE',
    chat: chat.toString(),
    message: {
        id: id,
        idSender: sender.toString(),
        idChat: chat.toString(),
        chatName: chatName,
        senderUsername: senderUsername,
        content,
        deletedAt
    }
})

export const mqDeleteChat = ({ chat }: { chat: string }): MqMessage => ({
    type: 'CHAT_DELETE',
    chat: chat.toString()
})