const extractResponseCookie = res => {
	const cookies = res.headers['set-cookie']
	const jwt = cookies[0]?.split(';')[0].split('=')[1]

	return jwt
}

const jwtCookie = jwt => `jwt=${jwt};`

exports.extractResponseCookie = extractResponseCookie
exports.jwtCookie = jwtCookie