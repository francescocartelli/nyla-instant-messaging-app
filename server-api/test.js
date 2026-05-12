const request = require('supertest')

const app = require('./app')

const { connect: connectDb } = require('./config/Db')
const { connect: connectMq } = require('./config/Mq')

require('dotenv').config()

const extractResponseCookie = res => {
	const cookies = res.headers['set-cookie']
	const jwt = cookies[0]?.split(';')[0].split('=')[1]

	return jwt
}

const jwtCookie = jwt => `jwt=${jwt};`

const signupRequests = [
	{ username: 'TestUser001', email: 'testuser001@test.com', password: '000000Ab!' },
	{ username: 'TestUser002', email: 'testuser002@test.com', password: '000000Ab!' },
	{ username: 'TestUser002', email: 'testuser003@test.com', password: '000000Ab!' }
]

const signUser = async ({ username, email, password }) => {
	const signupRes = await request(app)
		.post('/api/authenticate/signup')
		.send({ username, email, password })

	const res = await request(app)
		.post('/api/authenticate/signin')
		.send({ userIdentifier: username, password })

	const jwt = extractResponseCookie(res)

	return { ...res.body, jwt }
}

describe('API server chats', () => {
	let users = []
	let chats = []
	let nChats = null

	beforeAll(async () => {
		await connectDb(process.env.DATABASE_URL, process.env.DATABASE_NAME)
		await connectMq(process.env.MQ_SERVER_URL)

		const results = await Promise.all(signupRequests.map(signUser))
		users = results
	})

	afterAll(async () => {
		for ({ jwt } of users) {
			await request(app)
				.delete('/api/users/current')
				.set('Cookie', jwtCookie(jwt))
		}

		await Promise.all(chats.map(({ id }) => request(app)
			.delete(`/api/chats/${id}`)
			.set('Cookie', jwtCookie(users[0].jwt))))
	})

	test.each([
		{
			title: 'empty',
			send: () => ({}),
			expected: 400
		}, {
			title: 'no users',
			send: () => ({ name: null, isGroup: false }),
			expected: 400
		}, {
			title: 'direct chat cannot have name',
			send: () => ({ name: 'direct chat', users: [{ id: users[0].id, isAdmin: true }, { id: users[1].id }], isGroup: false }),
			expected: 400
		}, {
			title: 'too many users',
			send: () => ({ name: null, users: [{ id: users[0].id, isAdmin: true }, { id: users[1].id }, { id: users[2].id }], isGroup: false }),
			expected: 400
		}, {
			title: 'user not existing',
			send: () => ({ name: null, users: [{ id: users[0].id, isAdmin: true }, { id: "1a036147bc84329498844272" }], isGroup: false }),
			expected: 400
		}, {
			title: 'ok',
			send: () => ({ name: null, users: [{ id: users[0].id, isAdmin: true }, { id: users[1].id }], isGroup: false }),
			expected: 200
		}
	])('Create direct chat: $title [$expected]', async ({ send, expected }) => {
		const res = await request(app)
			.post('/api/chats')
			.set('Cookie', jwtCookie(users[0].jwt))
			.send(send())
			.expect(expected)
	})

	test.each([
		{
			title: 'empty',
			send: () => ({}),
			expected: 400
		}, {
			title: 'no users',
			send: () => ({ name: null, isGroup: true }),
			expected: 400
		}, {
			title: 'direct chat should have name',
			send: () => ({ name: null, users: [{ id: users[0].id, isAdmin: true }, { id: users[1].id }], isGroup: true }),
			expected: 400
		}, {
			title: 'not enough users',
			send: () => ({ name: 'Group Chat', users: [{ id: users[0].id, isAdmin: true }], isGroup: true }),
			expected: 400
		}, {
			title: 'user not existing',
			send: () => ({ name: 'Group Chat', users: [{ id: users[0].id, isAdmin: true }, { id: "1a036147bc84329498844272" }], isGroup: true }),
			expected: 400
		}, {
			title: 'admin required',
			send: () => ({ name: 'Group Chat', users: [{ id: users[0].id }, { id: "1a036147bc84329498844272" }], isGroup: true }),
			expected: 400
		}, {
			title: 'ok',
			send: () => ({ name: 'Group Chat', users: [{ id: users[0].id, isAdmin: true }, { id: users[1].id }], isGroup: true }),
			expected: 200
		}
	])('Create group chat: $title [$expected]', async ({ send, expected }) => {
		const res = await request(app)
			.post('/api/chats')
			.set('Cookie', jwtCookie(users[0].jwt))
			.send(send())
			.expect(expected)
	})
})