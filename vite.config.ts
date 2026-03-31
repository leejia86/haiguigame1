import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(() => {


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
