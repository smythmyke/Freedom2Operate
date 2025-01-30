import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      REACT_APP_PAYPAL_CLIENT_ID: process.env.REACT_APP_PAYPAL_CLIENT_ID,
      REACT_APP_SENDGRID_API_KEY: process.env.REACT_APP_SENDGRID_API_KEY,
      REACT_APP_SENDER_EMAIL: process.env.REACT_APP_SENDER_EMAIL,
      REACT_APP_ADMIN_EMAIL: process.env.REACT_APP_ADMIN_EMAIL
    }
  }
})
