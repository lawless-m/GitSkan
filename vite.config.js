import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '/GitSkan/', // Important for GitHub Pages subdirectory
  build: {
    outDir: 'dist'
  }
})
