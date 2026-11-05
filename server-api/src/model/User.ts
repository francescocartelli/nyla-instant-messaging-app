import { ObjectId } from "mongodb"

export interface User {
    id: ObjectId | string
    username: string
    email: string
    bio?: string
    provider?: string | null
    hash?: string | null
    confirmed?: boolean
    createdAt: Date
}

export type UserDocument = Omit<User, 'id'> & {
    _id?: ObjectId
}

export type PublicUser = Pick<User,
    'id' |
    'username' |
    'bio' |
    'confirmed'
>

export type NewUser = Omit<User,
    'id' |
    'bio' |
    'createdAt'
>

export type UserHash = Pick<User,
    'id' |
    'hash'
>

export type UpdateUser = Omit<User,
    'id' |
    'createdAt'
>

export const newUser = ({
    username,
    email,
    provider = null,
    hash = null,
    confirmed = false
}: NewUser): Omit<User, 'id'> => ({
    username,
    email,
    bio: "",
    provider,
    hash,
    confirmed,
    createdAt: new Date()
})