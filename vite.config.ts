import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 读取所有 env（包含非 VITE_ 前缀），仅用于 dev server 侧代理注入鉴权
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.VITE_AI_API_KEY || env.AI_API_KEY
  const baseUrl = env.VITE_AI_BASE_URL || env.AI_BASE_URL || 'https://api.openai.com'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // 前端请求同源 /api/chat，dev server 代理到后端服务，避免 CORS
        '/api/chat': {
          target: 'http://localhost:3003',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
