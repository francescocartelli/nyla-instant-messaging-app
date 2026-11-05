
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		clearMocks: true,
		reporters: ['verbose'],
		fileParallelism: false,
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
		]
	}
})