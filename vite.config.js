import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' works on any GitHub Pages repo path (HashRouter handles routing)
export default defineConfig({ base: './', plugins: [react(), tailwindcss()] })
