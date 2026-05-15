const request = require('supertest')
const dotenv = require('dotenv')

const app = require('../app')

dotenv.config()

const { connect: connectDb, close: closeDb } = require('../config/Db')
const { connect: connectMq, close: closeMq } = require('../config/Mq')

const createDeleteUser = require('./setup/deleteUser')
const { jwtCookie, extractResponseCookie } = require('./setup/utils')

describe('API server users tests', () => {
	let users = []

	beforeAll(async () => {
		await connectDb(process.env.DATABASE_URL, process.env.DATABASE_NAME)
		await connectMq(process.env.MQ_SERVER_URL)
	})

	afterAll(async () => {
		const deleteUser = createDeleteUser(app)

		for (const user of users) {
			await deleteUser(user)
		}

		await closeDb()
		await closeMq()
	})

	test.each([{
		title: "too short username",
		send: {
			username: "Pixel",
			email: "pixelsamurai@test.com",
			password: "Xy-012345"
		},
		expected: 400
	}, {
		title: "invalid email",
		send: {
			username: "EchoNomad",
			email: "echonomad",
			password: "Xy-012345"
		},
		expected: 400
	}, {
		title: "too simple password",
		send: {
			username: "SilentPanda",
			email: "silentpanda@test.com",
			password: "too-simple"
		},
		expected: 400
	}, {
		title: "ok user 1",
		send: {
			username: "SilentFox",
			email: "silentfox@test.com",
			password: "Xy-012345"
		},
		expected: 200
	}, {
		title: "ok user 2",
		send: {
			username: "Silent000",
			email: "silent001@test.com",
			password: "Xy-012345"
		},
		expected: 200
	}, {
		title: "ok user 3",
		send: {
			username: "EchoBus1",
			email: "ecobus1@test.com",
			password: "Xy-012345"
		},
		expected: 200
	}, {
		title: "username already taken",
		send: {
			username: "EchoBus1",
			email: "eco-bus@test.com",
			password: "Xy-012345"
		},
		expected: 400
	}, {
		title: "email already taken",
		send: {
			username: "EchoBus10",
			email: "ecobus1@test.com",
			password: "Xy-012345"
		},
		expected: 400
	}])('Signup: $title [$expected]', async ({ send, expected }) => {
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

	test.each([{
		title: "wrong user identifier",
		send: {
			userIdentifier: "EchoBus",
			password: "Xy-012345"
		},
		expected: 401
	}, {
		title: "wrong password",
		send: {
			userIdentifier: "EchoBus1",
			password: "000000Ab"
		},
		expected: 401
	}, {
		title: "wrong both",
		send: {
			userIdentifier: "Echous1",
			password: "00000Ab!"
		},
		expected: 401
	}, {
		title: "ok (using username)",
		send: {
			userIdentifier: "EchoBus1",
			password: "Xy-012345"
		},
		expected: 200
	}, {
		title: "ok (using email)",
		send: {
			userIdentifier: "ecobus1@test.com",
			password: "Xy-012345"
		},
		expected: 200
	}])('Signin: $title [$expected]', async ({ send, expected }) => {
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
	},{
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