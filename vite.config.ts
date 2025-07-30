import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: 'es2022', // Support BigInt literals and modern features
  },
  build: {
    target: 'es2022', // Support BigInt literals and modern features
    rollupOptions: {
      output: {
        format: 'es',
      },
    },
  },
  optimizeDeps: {
    include: ['viem'],
    esbuildOptions: {
      target: 'es2022',
    },
  },
  define: {
    global: 'globalThis',
  },
})
