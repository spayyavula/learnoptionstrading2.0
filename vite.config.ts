import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Force new chunk names with timestamp
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          pricing: ['./src/pages/PricingPage'] // Force PricingPage into separate chunk
        }
      }
    }
  },
  // Clear all caches
  optimizeDeps: {
    force: true
  },
  server: {
    fs: {
      strict: false
    }
  }
})