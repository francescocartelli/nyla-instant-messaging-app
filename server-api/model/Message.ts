import { ObjectId } from "mongodb"
import { Block, Mark } from "../types/bodies/MessageCreate.ts"

export type Content = (Block | Mark)[]

export interface RepliedTo {
    id: ObjectId | string
    idSender: ObjectId | string
    content: Content
    createdAt: Date
}

export interface Message {
    id: ObjectId | string
    chat: ObjectId | string
    sender: ObjectId | string
    content?: Content | null
    repliedTo?: RepliedTo | null
    createdAt: Date
    updatedAt?: Date | null
    deletedAt?: Date | null
}

export type MessageDocument = Omit<Message, 'id'> & {
    _id?: ObjectId
}

export type PublicMessage = Omit<Message,
    'chat' |
    'sender'
> & {
    chat: string
    idChat: ObjectId
    sender: string
    idSender: ObjectId
}

export type Identifiable = Pick<Message, 'id'>

export type NewMessage = Pick<Message, 'chat' | 'sender' | 'content' | 'repliedTo'>

export type UpdateMessage = Pick<Message, 'content'>