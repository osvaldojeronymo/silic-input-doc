import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
        main: 'index.html',
        'form-renderer': 'form-renderer.html'
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          rjsf: ['@rjsf/core', '@rjsf/validator-ajv8'],
          quill: ['react-quill', 'quill'],
          dnd: ['@dnd-kit/core']
        }
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
