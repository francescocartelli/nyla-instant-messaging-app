import { ObjectId } from "mongodb"

import { oid } from "../config/db.ts"

export type ChatMembers = Array<DirectChatMember> | Array<GroupChatMember>

export interface Chat {
    id: ObjectId
    name: string | null
    users: Array<DirectChatMember> | Array<GroupChatMember>
    isGroup: boolean
    createdAt: Date
    updatedAt: Date
}

export type ChatDocument = Omit<Chat, 'id'> & {
    _id?: ObjectId
}

export type PublicChatFull = PublicChat & {
    usersFull?: ChatMembers
}

export type Identifiable = Pick<Chat, 'id'>

// projection
export interface PublicChat extends Pick<Chat,
    'id' |
    'name' |
    'isGroup' |
    'createdAt' |
    'updatedAt'
> {
    users: string
    nUsers: number
    messages: string
}

// update
export type ChatUpdate = Pick<Chat,
    'name'
>

// members
export interface DirectChatMemberInput {
    id: string
}

export interface DirectChatMember {
    id: ObjectId
}

export interface GroupChatMemberInput {
    id: string
    isAdmin: boolean
}

export interface GroupChatMember {
    id: ObjectId
    isAdmin: boolean
    joinedAt: Date
}

export const groupChatMember = ({ id, isAdmin }: GroupChatMemberInput): GroupChatMember => ({
    id: oid(id),
    isAdmin,
    joinedAt: new Date()
})

export const directChatMember = ({ id }: DirectChatMemberInput): DirectChatMember => ({
    id: oid(id)
})

type UserInChatPrefix = Record<string, any>

export const userInChatPrefix = (user: any, prefix: string = "users.$[u]"): UserInChatPrefix => Object.fromEntries(Object.entries(user).flatMap(([key, value]) => value === null || value === undefined ? [] : [[`${prefix}.${key}`, value]]))

// create
export type NewChatInput = Pick<Chat,
    'name' |
    'isGroup'
> & {
    users: Array<DirectChatMemberInput> | Array<GroupChatMemberInput>
}

export type NewChat = Pick<Chat,
    'name' |
    'users' |
    'isGroup' |
    'createdAt' |
    'updatedAt'
>

export const newChat = ({ name, users, isGroup }: NewChatInput): NewChat => {
    const userMapping = isGroup ? groupChatMember : directChatMember

    return {
        name: isGroup ? name : null,
        users: users.map(userMapping as any),
        isGroup,
        createdAt: new Date(),
        updatedAt: new Date()
    }
}