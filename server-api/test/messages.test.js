const request = require('supertest')
const dotenv = require('dotenv')

const app = require('../app')

dotenv.config()

const { connect: connectDb, close: closeDb } = require('../config/Db')
const { connect: connectMq, close: closeMq } = require('../config/Mq')

const createSignUser = require('./setup/signUser')
const createDeleteUser = require('./setup/deleteUser')
const { jwtCookie } = require('./setup/utils')
const newMessageContent = require('./setup/newMessageContent')

const signupRequests = require('./data/users.json')

describe('API server users tests', () => {
	let users = []
	let chat = null
	let messages = []

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

		await request(app)
			.delete(`/api/chats/${chat.id}`)
			.set('Cookie', jwtCookie(users[0].jwt))

		await closeDb()
		await closeMq()
	})

	test.each([{
		title: 'ok',
		send: () => ({ name: 'Group Chat', users: [{ id: users[0].id, isAdmin: true }, { id: users[1].id }], isGroup: true }),
		expected: 200
	}])('Create group chat: $title [$expected]', async ({ send, expected }) => {
		const res = await request(app)
			.post('/api/chats')
			.set('Cookie', jwtCookie(users[0].jwt))
			.send(send())
			.expect(expected)

		if (res.ok) chat = res.body
	})

	test.each([{
		title: 'bad id',
		chat: () => 'invalid',
		jwt: () => users[0].jwt,
		send: newMessageContent('Hi all'),
		expected: 400
	}, {
		title: 'not found',
		chat: () => '1a036147bc84329498844272',
		jwt: () => users[0].jwt,
		send: newMessageContent('Hi all'),
		expected: 404
	}, {
		title: 'user not in chat',
		chat: () => chat.id,
		jwt: () => users[2].jwt,
		send: newMessageContent('Hi all'),
		expected: 401
	}, {
		title: 'not content',
		chat: () => chat.id,
		jwt: () => users[0].jwt,
		send: {},
		expected: 400
	}, {
		title: 'ok',
		chat: () => chat.id,
		jwt: () => users[0].jwt,
		send: newMessageContent('Hi all'),
		expected: 200
	}])('Create new message: $title [$expected]', async ({ chat, jwt, send, expected }) => {
		const res = await request(app)
			.post(`/api/chats/${chat()}/messages`)
			.set('Cookie', jwtCookie(jwt()))
			.send(send)
			.expect(expected)

		if (res.ok) messages.push(res.body)
	})

	test.each([{
		title: 'bad id',
		chat: () => 'invalid',
		jwt: () => users[1].jwt,
		send: () => ({ ...newMessageContent('Hi to you!'), repliedToId: messages[0].id }),
		expected: 400
	}, {
		title: 'not found',
		chat: () => '1a036147bc84329498844272',
		jwt: () => users[1].jwt,
		send: () => ({ ...newMessageContent('Hi to you!'), repliedToId: messages[0].id }),
		expected: 404
	}, {
		title: 'user not in chat',
		chat: () => chat.id,
		jwt: () => users[2].jwt,
		send: () => ({ ...newMessageContent('Hi to you!'), repliedToId: messages[0].id }),
		expected: 401
	}, {
		title: 'not content',
		chat: () => chat.id,
		jwt: () => users[1].jwt,
		send: () => ({}),
		expected: 400
	}, {
		title: 'ok',
		chat: () => chat.id,
		jwt: () => users[1].jwt,
		send: () => ({ ...newMessageContent('Hi to you!'), repliedToId: messages[0].id }),
		expected: 200
	}])('Create new message: reply $title [$expected]', async ({ chat, send, jwt, expected }) => {
		const res = await request(app)
			.post(`/api/chats/${chat()}/messages`)
			.set('Cookie', jwtCookie(jwt()))
			.send(send())
			.expect(expected)

		if (res.ok) messages.push(res.body)
	})

	let cursor = null
	test.each([{
		title: 'bad id',
		chat: () => 'invalid',
		jwt: () => users[1].jwt,
		expected: 400
	}, {
		title: 'not found',
		chat: () => '1a036147bc84329498844272',
		jwt: () => users[1].jwt,
		expected: 404
	}, {
		title: 'user not in chat',
		chat: () => chat.id,
		jwt: () => users[2].jwt,
		expected: 401
	}, {
		title: 'ok',
		chat: () => chat.id,
		jwt: () => users[1].jwt,
		expected: 200,
		messagesNumber: 2
	}, {
		title: 'ok next page',
		chat: () => chat.id,
		jwt: () => users[1].jwt,
		expected: 200,
		messagesNumber: 0
	}])('Get messages: $title [$expected]', async ({ chat, jwt, expected, messagesNumber }) => {
		const res = await request(app)
			.get(`/api/chats/${chat()}/messages?cursor=${cursor}`)
			.set('Cookie', jwtCookie(jwt()))
			.expect(expected)

		if (res.ok) {
			cursor = res.body.nextCursor
			expect(res.body.messages.length).toBe(messagesNumber)
		}
	})

	const nMessages = 25
	test(`Create new messages: add ${nMessages} messages [200]`, async () => {
		for (let i = 0; i < nMessages; i++) {
			const res = await request(app)
				.post(`/api/chats/${chat.id}/messages`)
				.set('Cookie', jwtCookie(users[i % 2].jwt))
				.send(newMessageContent(`New message of ${i} index`))
				.expect(200)
		}
	})

	cursor = null
	test(`Get messages: check paging max 10 page [200]`, async () => {
		const ids = new Set([])
		let lastCreatedAt = new Date(8640000000000000)
		let lastPageSize = Infinity

		for (let i = 0; i < 10; i++) {
			const res = await request(app)
				.get(`/api/chats/${chat.id}/messages?cursor=${cursor}`)
				.set('Cookie', jwtCookie(users[0].jwt))
				.expect(200)

			// test page size
			expect(lastPageSize >= res.body.messages.length).toBe(true)
			lastPageSize = res.body.messages.length

			for (let message of res.body.messages) {
				// test the absence of duplicates
				expect(ids.has(message.id)).toBe(false)
				ids.add(message.id)

				// test the message creation order
				const dt = new Date(message.createdAt)
				expect(lastCreatedAt > dt).toBe(true)
				lastCreatedAt = dt
			}

			if (!res.body.nextCursor) return

			cursor = res.body.nextCursor
		}
	})

	test.each([{
		title: 'bad id chat',
		chat: () => 'invalid',
		message: () => messages[0].id,
		jwt: () => users[1].jwt,
		expected: 400
	}, {
		title: 'not found chat',
		chat: () => '1a036147bc84329498844272',
		message: () => messages[0].id,
		jwt: () => users[1].jwt,
		expected: 404
	}, {
		title: 'bad id message',
		chat: () => chat.id,
		message: () => 'invalid',
		jwt: () => users[1].jwt,
		expected: 400
	}, {
		title: 'not found message',
		chat: () => chat.id,
		message: () => '1a036147bc84329498844272',
		jwt: () => users[1].jwt,
		expected: 404
	}, {
		title: 'user not in chat',
		chat: () => chat.id,
		message: () => messages[0].id,
		jwt: () => users[2].jwt,
		expected: 401
	}, {
		title: 'ok',
		chat: () => chat.id,
		message: () => messages[0].id,
		jwt: () => users[1].jwt,
		expected: 200
	}])('Get message: $title [$expected]', async ({ chat, message, jwt, expected }) => {
		const res = await request(app)
			.get(`/api/chats/${chat()}/messages/${message()}`)
			.set('Cookie', jwtCookie(jwt()))
			.expect(expected)
	})

	const updatedContent = newMessageContent('Hi!')
	const updateMessageRequests = [{
		title: 'bad id chat',
		chat: () => 'invalid',
		message: () => messages[0].id,
		jwt: () => users[0].jwt,
		send: updatedContent,
		expected: 400
	}, {
		title: 'not found chat',
		chat: () => '1a036147bc84329498844272',
		message: () => messages[0].id,
		jwt: () => users[0].jwt,
		send: updatedContent,
		expected: 404
	}, {
		title: 'bad id message',
		chat: () => chat.id,
		message: () => 'invalid',
		jwt: () => users[0].jwt,
		send: updatedContent,
		expected: 400
	}, {
		title: 'not found message',
		chat: () => chat.id,
		message: () => '1a036147bc84329498844272',
		jwt: () => users[0].jwt,
		send: updatedContent,
		expected: 404
	}, {
		title: 'user not in chat',
		chat: () => chat.id,
		message: () => messages[0].id,
		jwt: () => users[2].jwt,
		send: updatedContent,
		expected: 401
	}, {
		title: 'user not sender',
		chat: () => chat.id,
		message: () => messages[0].id,
		jwt: () => users[1].jwt,
		send: updatedContent,
		expected: 401
	}, {
		title: 'ok',
		chat: () => chat.id,
		message: () => messages[0].id,
		jwt: () => users[0].jwt,
		send: updatedContent,
		expected: 200
	}]

	test.each(updateMessageRequests)('Update message: $title [$expected]', async ({ chat, message, jwt, send, expected }) => {
		const res = await request(app)
			.put(`/api/chats/${chat()}/messages/${message()}`)
			.set('Cookie', jwtCookie(jwt()))
			.send(send)
			.expect(expected)
	})

	test('Get message: check updated message [200]', async () => {
		const res = await request(app)
			.get(`/api/chats/${chat.id}/messages/${messages[0].id}`)
			.set('Cookie', jwtCookie(users[0].jwt))
			.expect(200)

		if (res.ok) expect(res.body.content[0].children[0].text).toBe(updatedContent.content[0].children[0].text)
	})

	test.each(updateMessageRequests)('Delete message: $title [$expected]', async ({ chat, message, jwt, expected }) => {
		const res = await request(app)
			.delete(`/api/chats/${chat()}/messages/${message()}`)
			.set('Cookie', jwtCookie(jwt()))
			.expect(expected)
	})

	test('Get message: check deleted message [404]', async () => {
		const res = await request(app)
			.get(`/api/chats/${chat.id}/messages/${messages[0].id}`)
			.set('Cookie', jwtCookie(users[0].jwt))
			.expect(200)

		expect(res.body.content).toBe(null)
	})
})