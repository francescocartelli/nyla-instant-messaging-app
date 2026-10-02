import { NextFunction, Request, Response } from "express"

type ValidationFunction = (param: any) => boolean

const validate = (validationFunction: ValidationFunction) => (idParam: string) => (req: Request, res: Response, next: NextFunction) => {
    if (!validationFunction(req.params[idParam])) return res.status(400).json({ message: "Bad id" })

    next()
}

export default validate