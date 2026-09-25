import { Response } from "supertest"

const extractResponseCookie = (res: Response) => {
	const cookies = res.headers['set-cookie']
	const jwt = cookies[0]?.split(';')[0].split('=')[1]

	return jwt
}

const jwtCookie = (jwt: string) => `jwt=${jwt};`

export { extractResponseCookie, jwtCookie }
