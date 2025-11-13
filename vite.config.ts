import { defineConfig } from 'vite'

export default defineConfig({
  root: '.', 
  base: '/silic-input-doc/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/components',
      '@/styles': '/src/styles', 
      '@/views': '/src/views'
    }
  }
})
