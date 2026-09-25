import type { Config } from 'jest'

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				tsconfig: './tsconfig.jest.json',
				diagnostics: false,
			},
		],
	},
	moduleFileExtensions: ['ts', 'js', 'json'],
	testMatch: [
		'**/__tests__/**/*.test.ts',
		'**/?(*.)+(spec|test).ts',
	],
	clearMocks: true,
	verbose: true,
}

export default config