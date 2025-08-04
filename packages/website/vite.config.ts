import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../../web-dist',
    emptyOutDir: true
  }
  // Note: Client-side routing is handled automatically by Vite's dev server
  // For production, CloudFront is configured to redirect 404s to index.html
  // This ensures both /demo and / routes work correctly in all environments
})
