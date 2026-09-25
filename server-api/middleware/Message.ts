import type { NextFunction, Response } from "express"

import { notFoundId, SENDER_REQUIRED } from "../constants/ResponseMessages.ts"

import * as messageServices from "../services/Message.ts"

import { AuthRequest } from "../types/AuthRequest.ts"

export const isMessageAuthor = (idChatParam: string, idMessageParam: string) => async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const idChat = req.params[idChatParam] as string
    const idMessage = req.params[idMessageParam] as string

    const message = await messageServices.getMessage(idChat, idMessage)
    if (!message) return res.status(404).json({ message: notFoundId("message") })
    if (message.idSender.toString() !== user!.id.toString()) return res.status(401).json({ message: SENDER_REQUIRED })

    res.locals.message = message

    next()
}
