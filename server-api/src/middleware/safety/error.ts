import type { ErrorRequestHandler } from "express"

type ErrorOptions = {
	onError?: (stack?: string) => void
	message: string
}

export const error = ({ onError, message }: ErrorOptions): ErrorRequestHandler => (err, req, res, next) => {
	onError?.(err.stack)

	return res.status(500).json({ message })
}