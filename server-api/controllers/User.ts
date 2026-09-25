import type { Request, Response } from "express"

import { notFoundId, notModified, USERNAME_TAKEN } from "../constants/ResponseMessages.ts"

import chatServices from "../services/Chat.ts"
import usersServices, { SearchType } from "../services/User.ts"

import { AuthRequest } from "../types/AuthRequest.ts"

export const getUsers = async (req: Request, res: Response) => {
    const { username, searchType } = req.query

    const users = await usersServices.getUsers(username as string, searchType as SearchType)
    res.json(users)
}

export const getUser = async (req: Request, res: Response) => {
    const user = await usersServices.getUser({ id: req.params.id as string })
    if (!user) return res.status(404).json({ message: notFoundId("user") })

    res.json(user)
}

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
    const { id } = req.user

    const user = await usersServices.getUser({ id: id })
    if (!user) return res.status(404).json({ message: notFoundId("user") })

    res.json(user)
}

export const updateUser = async (req: AuthRequest, res: Response) => {
    const { username } = req.body

    const user = await usersServices.getUser({ username: username })
    if (user) return res.status(400).json({ message: USERNAME_TAKEN })

    const { modifiedCount } = await usersServices.updateUser(req.params.id as string, req.body)
    if (modifiedCount < 1) return res.status(304).json({ message: notModified() })

    res.end()
}

export const deleteUser = async (req: AuthRequest, res: Response) => {
    const { id } = req.user

    const results = await chatServices.deleteUserChats(id.toString())
    if (results.failed > 0) return res.json({
        chats: results,
        user: 0
    })

    const { deletedCount } = await usersServices.deleteUser(id.toString())
    if (deletedCount < 1) return res.json({
        chats: results,
        user: 0
    })

    res.clearCookie('jwt')
    res.json({
        chats: results,
        user: 1
    })
}