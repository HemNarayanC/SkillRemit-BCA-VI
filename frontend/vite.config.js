import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return defineConfig({
    plugins: [react(), tailwindcss(),],
    server: {
      port: Number(env.VITE_PORT) || 5173,
      host: env.VITE_HOST === 'true',
      strictPort: false,
    }
  })
}