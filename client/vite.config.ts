import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['edythe-desireless-uxorially.ngrok-free.dev', 'localhost'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Оптимизация для производительности
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Отдельный чанк для framer-motion (большая библиотека)
          'framer-motion': ['framer-motion'],
          // Отдельный чанк для react/router
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Zustand и tanstack-query
          'state': ['zustand', '@tanstack/react-query'],
        },
      },
    },
    // Сжатие
    cssMinify: true,
  },
  // Оптимизация разработки
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'zustand'],
  },
})
