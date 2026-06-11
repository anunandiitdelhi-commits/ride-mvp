import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

server: {
  proxy: {
    '/socket.io': {
     target: 'https://zooming-light.up.railway.app',
     ws : true,
    
    },

    '/api':{
      target: 'https://zooming-light.up.railway.app',
      changeOrigin: true,
    },
  },
},
})

