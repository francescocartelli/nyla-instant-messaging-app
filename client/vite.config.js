import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') }
      ]
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_URL,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
