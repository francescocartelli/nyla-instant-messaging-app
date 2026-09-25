import { notFoundId, USERNAME_TAKEN, notModified } from "../constants/ResponseMessages.js"

import chatServices from "../services/Chat.js"
import usersServices from "../services/User.js"

export const getUsers = async (req, res) => {
    const { username, searchType } = req.query

    const users = await usersServices.getUsers(username, searchType)
    res.json(users)
}

export const getUser = async (req, res) => {
    const user = await usersServices.getUser({ id: req.params.id })
    if (!user) return res.status(404).json({ message: notFoundId("user") })

    res.json(user)
}

export const getCurrentUser = async (req, res) => {
    const { id } = req.user

    const user = await usersServices.getUser({ id: id })
    if (!user) return res.status(404).json({ message: notFoundId("user") })

    res.json(user)
}

export const updateUser = async (req, res) => {
    const { username } = req.body

    const user = await usersServices.getUser({ username: username })
    if (user) return res.status(400).json({ message: USERNAME_TAKEN })

    const { modifiedCount } = await usersServices.updateUser(req.params.id, req.body)
    if (modifiedCount < 1) return res.status(304).json({ message: notModified() })

    res.end()
}

export const deleteUser = async (req, res) => {
    const { id } = req.user

    const results = await chatServices.deleteUserChats(id)
    if (results.failed > 0) return res.json({
        chats: results,
        user: 0
    })

    const { deletedCount } = await usersServices.deleteUser(id)
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