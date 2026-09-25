import type { Request, Response, NextFunction } from "express"

const passThrough = (req: Request, res: Response, next: NextFunction) => next()

export default passThrough