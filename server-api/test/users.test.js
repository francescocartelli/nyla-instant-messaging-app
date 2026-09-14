import dotenv from 'dotenv'
import request from 'supertest'

dotenv.config()

import { createLogger } from '../utility/logger.js'
createLogger(process.env.LOGGING_LEVELS)

let app = null

import createDeleteUser from './setup/deleteUser.js'
import { extractResponseCookie, jwtCookie } from './setup/utils.js'

import moreUsersSigninRequests from './data/more-users-signin.json' with { type: 'json' }
import moreUsersSignupRequests from './data/more-users-signup.json' with { type: 'json' }

describe('API server users tests', () => {
	let users = []

	beforeAll(async () => {
		app = (await import('../app.js')).default

		const { connect: connectDb } = await import('../config/Db.js')
		const { connect: connectMq } = await import('../config/Mq.js')

		await connectDb(process.env.DATABASE_URL, process.env.DATABASE_NAME)
		await connectMq(process.env.MQ_SERVER_URL)
	})

	afterAll(async () => {
		const deleteUser = createDeleteUser(app)

		for (const user of users) {
			await deleteUser(user)
		}

		const { close: closeDb } = await import('../config/Db.js')
		const { close: closeMq } = await import('../config/Mq.js')

		await closeDb()
		await closeMq()
	})

	test.each(moreUsersSignupRequests)('Signup: $title [$expected]', async ({ send, expected }) => {
		const res = await request(app)
			.post(`/api/authenticate/signup`)
			.send(send)
			.expect(expected)

		if (res.ok) users.push({
			...res.body,
			...send,
			jwt: extractResponseCookie(res)
		})
	})

	test.each(moreUsersSigninRequests)('Signin: $title [$expected]', async ({ send, expected }) => {
		const res = await request(app)
			.post(`/api/authenticate/signin`)
			.send(send)
			.expect(expected)
	})

	test.each([{
		title: 'ok (contains pattern) [200]',
		query: '?username=Echo',
		expectedNumber: 1
	}, {
		title: 'ok (contains lowercase pattern) [200]',
		query: '?username=echo',
		expectedNumber: 1
	}, {
		title: 'ok (contains lowercase pattern) [200]',
		query: '?username=silent',
		expectedNumber: 2
	}, {
		title: 'ok (exact pattern) [200]',
		query: '?username=EchoBus1&searchType=exact',
		expectedNumber: 1
	}, {
		title: 'ok (exact pattern no result) [200]',
		query: '?username=sile&searchType=exact',
		expectedNumber: 0
	}])('Get users: $title', async ({ query, expectedNumber }) => {
		const res = await request(app)
			.get(`/api/users${query}`)
			.set('Cookie', jwtCookie(users[0].jwt))
			.expect(200)

		expect(res.body.length).toBe(expectedNumber)
	})

	test.each([{
		title: 'bad id',
		user: () => 'invalid',
		jwt: () => users[0].jwt,
		send: {
			username: 'SilentGuy'
		},
		expected: 400
	}, {
		title: 'not found',
		user: () => '1a036147bc84329498844272',
		jwt: () => users[0].jwt,
		send: {
			username: 'SilentGuy'
		},
		expected: 401
	}, {
		title: 'cannot modify other users',
		user: () => users[0].id,
		jwt: () => users[1].jwt,
		send: {
			username: 'SilentGuy'
		},
		expected: 401
	}, {
		title: 'username already taken',
		user: () => users[0].id,
		jwt: () => users[0].jwt,
		send: {
			username: 'Silent000'
		},
		expected: 400
	}, {
		title: 'ok [200]',
		user: () => users[0].id,
		jwt: () => users[0].jwt,
		send: {
			username: 'SilentGuy'
		},
		expected: 200
	}])('Get users: $title', async ({ user, jwt, send, expected }) => {
		const res = await request(app)
			.put(`/api/users/${user()}`)
			.set('Cookie', jwtCookie(jwt()))
			.send(send)
			.expect(expected)
	})

	test('Get user: check username update', async () => {
		const res = await request(app)
			.get(`/api/users/${users[0].id}`)
			.set('Cookie', jwtCookie(users[0].jwt))
			.expect(200)

		expect(res.body.username).toBe('SilentGuy')

		users[0].username = res.body.username
	})
})