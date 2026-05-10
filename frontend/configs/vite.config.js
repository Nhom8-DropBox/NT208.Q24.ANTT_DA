import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0", // truy cập từ ngoài vào
    port: 5173,
    strictPort: true // thay đổi port -> báo lỗi
  }
})
