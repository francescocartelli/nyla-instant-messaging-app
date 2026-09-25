import type { Request, Response, NextFunction } from "express"

const delayedPassThrough = (delay: number) => (req: Request, res: Response, next: NextFunction) => setTimeout(next, delay)

export default delayedPassThrough