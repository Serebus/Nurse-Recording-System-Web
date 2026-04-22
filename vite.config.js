import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite' // Added loadEnv
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL, // Now env is defined!
          changeOrigin: true,
          secure: false
        }
      }
    },
  }
})