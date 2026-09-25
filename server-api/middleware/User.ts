import type { NextFunction, Response } from "express"

import { USER_REQUIRED } from "../constants/ResponseMessages.ts"

import { AuthRequest } from "../types/AuthRequest.ts"

export const isUserCurrent = (idParam: string) => (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user

    if (user.id.toString() !== req.params[idParam]) return res.status(401).json({ message: USER_REQUIRED })

    next()
}