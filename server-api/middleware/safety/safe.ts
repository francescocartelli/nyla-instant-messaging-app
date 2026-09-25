import type { NextFunction, Request, Response } from "express"

export const safe = (controller: any) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await controller(req, res, next)
    } catch (err) {
        next(err)
    }
}