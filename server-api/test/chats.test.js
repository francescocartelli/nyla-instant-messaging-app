const request = require('supertest')
const dotenv = require('dotenv')

const app = require('../app')

dotenv.config()

const { connect: connectDb, close: closeDb } = require('../config/Db')
const { connect: connectMq, close: closeMq } = require('../config/Mq')

const createSignUser = require('./setup/signUser')
const createDeleteUser = require('./setup/deleteUser')
const { jwtCookie } = require('./setup/utils')

const signupRequests = require('./data/users.json')

describe('API server chats tests', () => {
	let users = []
	let chats = []

	beforeAll(async () => {
		await connectDb(process.env.DATABASE_URL, process.env.DATABASE_NAME)
		await connectMq(process.env.MQ_SERVER_URL)

		const results = await Promise.all(signupRequests.map(createSignUser(app)))

		users = results
	})

	afterAll(async () => {
		const deleteUser = createDeleteUser(app)

		for (const user of users) {
			await deleteUser(user)
		}

		await Promise.all(chats.map(({ id }) => request(app)
			.delete(`/api/chats/${id}`)
			.set('Cookie', jwtCookie(users[0].jwt))))

		await closeDb()
		await closeMq()
	})

	test.each([{
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
	}])('Create direct chat: $title [$expected]', async ({ send, expected }) => {
		const res = await request(app)
			.post('/api/chats')
			.set('Cookie', jwtCookie(users[0].jwt))
			.send(send())
			.expect(expected)

		if (res.ok) chats.push(res.body)
	})

	test.each([{
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
	}])('Create group chat: $title [$expected]', async ({ send, expected }) => {
		const res = await request(app)
			.post('/api/chats')
			.set('Cookie', jwtCookie(users[0].jwt))
			.send(send())
			.expect(expected)

		if (res.ok) chats.push(res.body)
	})

	test('Get personal chats: ok [200]', async () => {
		const res = await request(app)
			.get('/api/chats/personal')
			.set('Cookie', jwtCookie(users[0].jwt))
			.expect(200)

		expect(res.body.chats.length).toBe(2)
	})

	const getChatRequests = [{
		title: 'bad id',
		id: () => 'invalid',
		jwt: () => users[0].jwt,
		expected: 400
	}, {
		title: 'not found',
		id: () => '1a036147bc84329498844272',
		jwt: () => users[0].jwt,
		expected: 404
	}, {
		title: 'user not in chat',
		id: () => chats[0].id,
		jwt: () => users[2].jwt,
		expected: 401
	}, {
		title: 'ok',
		id: () => chats[0].id,
		jwt: () => users[0].jwt,
		expected: 200
	}]

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

	test.each([{
		title: 'bad id',
		id: () => 'invalid',
		send: { name: newName },
		jwt: () => users[0].jwt,
		expected: 400
	}, {
		title: 'not found',
		id: () => '1a036147bc84329498844272',
		send: { name: newName },
		jwt: () => users[0].jwt,
		expected: 404
	}, {
		title: 'only group chat',
		id: () => chats[0].id,
		send: { name: newName },
		jwt: () => users[2].jwt,
		expected: 400
	}, {
		title: 'user not in chat',
		id: () => chats[1].id,
		send: { name: newName },
		jwt: () => users[2].jwt,
		expected: 401
	}, {
		title: 'user not admin',
		id: () => chats[1].id,
		send: { name: newName },
		jwt: () => users[1].jwt,
		expected: 401
	}, {
		title: 'ok',
		id: () => chats[1].id,
		send: { name: newName },
		jwt: () => users[0].jwt,
		expected: 200
	}])('Update chat: $title [$expected]', async ({ id, jwt, send, expected }) => {
		const res = await request(app)
			.put(`/api/chats/${id()}`)
			.set('Cookie', jwtCookie(jwt()))
			.send(send)
			.expect(expected)
	})

	test('Get chat: check new name [200]', async () => {
		const res = await request(app)
			.get(`/api/chats/${chats[1].id}`)
			.set('Cookie', jwtCookie(users[0].jwt))
			.expect(200)

		expect(res.body.name).toBe(newName)
	})

	test('Get chats users: 2 expected [200]', async () => {
		const res = await request(app)
			.get(`/api/chats/${chats[1].id}/users`)
			.set('Cookie', jwtCookie(users[0].jwt))
			.expect(200)

		expect(res.body.length).toBe(2)
	})

	test.each([{
		title: 'bad chat id',
		chatId: () => 'invalid',
		userId: () => users[2].id,
		jwt: () => users[0].jwt,
		expected: 400
	}, {
		title: 'bad user id',
		chatId: () => 'invalid',
		userId: () => users[2].id,
		jwt: () => users[0].jwt,
		expected: 400
	}, {
		title: 'not found chat',
		chatId: () => '1a036147bc84329498844272',
		userId: () => users[2].id,
		jwt: () => users[0].jwt,
		expected: 404
	}, {
		title: 'not found user',
		chatId: () => chats[1].id,
		userId: () => '1a036147bc84329498844272',
		jwt: () => users[0].jwt,
		expected: 404
	}, {
		title: 'you are not in chat',
		chatId: () => chats[1].id,
		userId: () => users[2].id,
		jwt: () => users[2].jwt,
		expected: 401
	}, {
		title: 'you are not admin',
		chatId: () => chats[1].id,
		userId: () => users[2].id,
		jwt: () => users[1].jwt,
		expected: 401
	}, {
		title: 'group chat required',
		chatId: () => chats[0].id,
		userId: () => users[2].id,
		jwt: () => users[0].jwt,
		expected: 400
	}, {
		title: 'ok',
		chatId: () => chats[1].id,
		userId: () => users[2].id,
		jwt: () => users[0].jwt,
		expected: 200
	}])('Add chats user: $title [$expected]', async ({ chatId, userId, jwt, expected }) => {
		const res = await request(app)
			.post(`/api/chats/${chatId()}/users/${userId()}`)
			.set('Cookie', jwtCookie(jwt()))
			.expect(expected)
	})

	test('Get chats users: 3 expected [200]', async () => {
		const res = await request(app)
			.get(`/api/chats/${chats[1].id}/users`)
			.set('Cookie', jwtCookie(users[0].jwt))
			.expect(200)

		expect(res.body.length).toBe(3)
	})

	test.each([{
		title: 'bad chat id',
		chatId: () => 'invalid',
		userId: () => users[2].id,
		jwt: () => users[0].jwt,
		expected: 400
	}, {
		title: 'bad user id',
		chatId: () => 'invalid',
		userId: () => users[2].id,
		jwt: () => users[0].jwt,
		expected: 400
	}, {
		title: 'not found chat',
		chatId: () => '1a036147bc84329498844272',
		userId: () => users[2].id,
		jwt: () => users[0].jwt,
		expected: 404
	}, {
		title: 'not found user',
		chatId: () => chats[1].id,
		userId: () => '1a036147bc84329498844272',
		jwt: () => users[0].jwt,
		expected: 304
	}, {
		title: 'you are not admin',
		chatId: () => chats[1].id,
		userId: () => users[2].id,
		jwt: () => users[1].jwt,
		expected: 401
	}, {
		title: 'group chat required',
		chatId: () => chats[0].id,
		userId: () => users[2].id,
		jwt: () => users[0].jwt,
		expected: 400
	}, {
		title: 'ok',
		chatId: () => chats[1].id,
		userId: () => users[2].id,
		jwt: () => users[0].jwt,
		expected: 200
	}])('Delete chats user: $title [$expected]', async ({ chatId, userId, jwt, expected }) => {
		const res = await request(app)
			.delete(`/api/chats/${chatId()}/users/${userId()}`)
			.set('Cookie', jwtCookie(jwt()))
			.expect(expected)
	})

	test('Get chats users: 2 expected [200]', async () => {
		const res = await request(app)
			.get(`/api/chats/${chats[1].id}/users`)
			.set('Cookie', jwtCookie(users[0].jwt))
			.expect(200)

		expect(res.body.length).toBe(2)
	})

	test.each([{
		title: 'bad chat id',
		chatId: () => 'invalid',
		userId: () => users[1].id,
		jwt: () => users[0].jwt,
		send: { isAdmin: true },
		expected: 400
	}, {
		title: 'bad user id',
		chatId: () => 'invalid',
		userId: () => users[1].id,
		jwt: () => users[0].jwt,
		send: { isAdmin: true },
		expected: 400
	}, {
		title: 'not found chat',
		chatId: () => '1a036147bc84329498844272',
		userId: () => users[1].id,
		jwt: () => users[0].jwt,
		send: { isAdmin: true },
		expected: 404
	}, {
		title: 'not found user',
		chatId: () => chats[1].id,
		userId: () => '1a036147bc84329498844272',
		jwt: () => users[0].jwt,
		send: { isAdmin: true },
		expected: 304
	}, {
		title: 'user not in chat',
		chatId: () => chats[1].id,
		userId: () => users[2].id,
		jwt: () => users[0].jwt,
		send: { isAdmin: true },
		expected: 304
	}, {
		title: 'you are not in chat',
		chatId: () => chats[1].id,
		userId: () => users[1].id,
		jwt: () => users[2].jwt,
		send: { isAdmin: true },
		expected: 401
	}, {
		title: 'you are not admin',
		chatId: () => chats[1].id,
		userId: () => users[1].id,
		jwt: () => users[1].jwt,
		send: { isAdmin: true },
		expected: 401
	}, {
		title: 'group chat required',
		chatId: () => chats[0].id,
		userId: () => users[1].id,
		jwt: () => users[0].jwt,
		send: { isAdmin: true },
		expected: 400
	}, {
		title: 'ok',
		chatId: () => chats[1].id,
		userId: () => users[1].id,
		jwt: () => users[0].jwt,
		send: { isAdmin: true },
		expected: 200
	}, {
		title: 'ok (self remove admin role)',
		chatId: () => chats[1].id,
		userId: () => users[1].id,
		jwt: () => users[1].jwt,
		send: { isAdmin: false },
		expected: 200
	}, {
		title: 'you are not admin',
		chatId: () => chats[1].id,
		userId: () => users[1].id,
		jwt: () => users[1].jwt,
		send: { isAdmin: true },
		expected: 401
	}])('Update chats user: $title [$expected]', async ({ chatId, userId, jwt, send, expected }) => {
		const res = await request(app)
			.put(`/api/chats/${chatId()}/users/${userId()}`)
			.set('Cookie', jwtCookie(jwt()))
			.send(send)
			.expect(expected)
	})

	test.each([{
		title: 'bad id',
		id: () => 'invalid',
		jwt: () => users[0].jwt,
		expected: 400
	}, {
		title: 'not found',
		id: () => '1a036147bc84329498844272',
		jwt: () => users[0].jwt,
		expected: 404
	}, {
		title: 'user not in chat',
		id: () => chats[1].id,
		jwt: () => users[2].jwt,
		expected: 401
	}, {
		title: 'user not admin',
		id: () => chats[1].id,
		jwt: () => users[1].jwt,
		expected: 401
	}, {
		title: 'ok',
		id: () => chats[1].id,
		jwt: () => users[0].jwt,
		expected: 200
	}])('Delete chat: $title [$expected]', async ({ id, jwt, send, expected }) => {
		const res = await request(app)
			.delete(`/api/chats/${id()}`)
			.set('Cookie', jwtCookie(jwt()))
			.send(send)
			.expect(expected)
	})

	test('Get chat: check deleted chat [404]', async () => {
		const res = await request(app)
			.get(`/api/chats/${chats[1].id}`)
			.set('Cookie', jwtCookie(users[0].jwt))
			.expect(404)
	})

	test('Get personal chats: ok after delete [200]', async () => {
		const res = await request(app)
			.get('/api/chats/personal')
			.set('Cookie', jwtCookie(users[0].jwt))
			.expect(200)

		expect(res.body.chats.length).toBe(1)
	})

	test.each([{
		title: 'ok (contains pattern) [200]',
		query: '?username=Test',
		expectedNumber: 3
	}, {
		title: 'ok (exact pattern) [200]',
		query: '?username=TestUser001&searchType=exact',
		expectedNumber: 1
	}, {
		title: 'ok (exact pattern no result) [200]',
		query: '?username=TestUser00&searchType=exact',
		expectedNumber: 0
	}])('Get users: $title', async ({ query, expectedNumber }) => {
		const res = await request(app)
			.get(`/api/users${query}`)
			.set('Cookie', jwtCookie(users[0].jwt))
			.expect(200)

		expect(res.body.length).toBe(expectedNumber)
	})
})