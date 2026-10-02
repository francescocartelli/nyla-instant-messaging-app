import _Ajv from 'ajv'
import * as addFormatsModule from 'ajv-formats'
import { NextFunction, Request, Response } from 'express'

const Ajv = _Ajv as unknown as typeof _Ajv.default
const addFormats = (addFormatsModule as any).default || addFormatsModule

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

const validate = (schema: object) => {
    const validator = ajv.compile(schema)

    return (req: Request, res: Response, next: NextFunction) => {
        const isValid = validator(req.body)

        if (!isValid) {
            return res.status(400).json({
                errors: validator.errors?.map((err) => ({
                    field: err.instancePath || err.params.missingProperty,
                    message: err.message
                }))
            })
        }

        next()
    }
}

export default validate