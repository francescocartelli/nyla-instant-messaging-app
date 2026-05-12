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
	{ username: 'TestUser003', email: 'testuser003@test.com', password: '000000Ab!' }
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
			title: 'cannot create chat for others',
			send: () => ({ name: null, users: [{ id: users[1].id, isAdmin: true }, { id: users[2].id }], isGroup: false }),
			expected: 401
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

		if (res.ok) chats.push(res.body)
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
			title: 'cannot create chat for others',
			send: () => ({ name: 'Group Chat', users: [{ id: users[1].id, isAdmin: true }, { id: users[2].id }], isGroup: true }),
			expected: 401
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

		if (res.ok) chats.push(res.body)
	})

	const getChatRequests = [
		{
			title: 'bad id',
			id: () => 'invalid',
			jwt: () => users[0].jwt,
			expected: 400
		},
		{
			title: 'not found',
			id: () => '1a036147bc84329498844272',
			jwt: () => users[0].jwt,
			expected: 404
		},
		{
			title: 'user not in chat',
			id: () => chats[0].id,
			jwt: () => users[2].jwt,
			expected: 401
		},
		{
			title: 'ok',
			id: () => chats[0].id,
			jwt: () => users[0].jwt,
			expected: 200
		}
	]

	test.each(getChatRequests)('Get chat: $title [$expected]', async ({ id, jwt, expected }) => {
		const res = await request(app)
			.get(`/api/chats/${id()}`)
			.set('Cookie', jwtCookie(jwt()))
			.expect(expected)
	})

	test.each(getChatRequests)('Get chat users: $title [$expected]', async ({ id, jwt, expected }) => {
		const res = await request(app)
			.get(`/api/chats/${id()}/users`)
			.set('Cookie', jwtCookie(jwt()))
			.expect(expected)
	})

	const newName = 'New name'
	const updateChatRequests = [
		{
			title: 'bad id',
			id: () => 'invalid',
			send: { name: newName },
			jwt: () => users[0].jwt,
			expected: 400
		},
		{
			title: 'not found',
			id: () => '1a036147bc84329498844272',
			send: { name: newName },
			jwt: () => users[0].jwt,
			expected: 404
		},
		{
			title: 'only group chat',
			id: () => chats[0].id,
			send: { name: newName },
			jwt: () => users[2].jwt,
			expected: 400
		},
		{
			title: 'user not in chat',
			id: () => chats[1].id,
			send: { name: newName },
			jwt: () => users[2].jwt,
			expected: 401
		},
		{
			title: 'user not admin',
			id: () => chats[1].id,
			send: { name: newName },
			jwt: () => users[1].jwt,
			expected: 401
		},
		{
			title: 'ok',
			id: () => chats[1].id,
			send: { name: newName },
			jwt: () => users[0].jwt,
			expected: 200
		}
	]

	test.each(updateChatRequests)('Update chat: $title [$expected]', async ({ id, jwt, send, expected }) => {
		const res = await request(app)
			.put(`/api/chats/${id()}`)
			.set('Cookie', jwtCookie(jwt()))
			.send(send)
			.expect(expected)
	})

	test('Get chat: check new name', async () => {
		const res = await request(app)
			.get(`/api/chats/${chats[1].id}`)
			.set('Cookie', jwtCookie(users[0].jwt))
			.expect(200)

		expect(res.body.name).toBe(newName)
	})
})