import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import  { resolve }  from 'path'

const pathSrc = resolve(__dirname, "src");
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": pathSrc,
    },
  },
})
