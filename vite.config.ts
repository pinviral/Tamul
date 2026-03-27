import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  // Try to load Firebase config from JSON file
  let firebaseConfig = {};
  try {
    const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (e) {
    console.warn('Could not read firebase-applet-config.json, relying on environment variables.');
  }

  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'تأمل - Taamul',
          short_name: 'تأمل',
          description: 'تطبيق التأمل والصحة النفسية',
          theme_color: '#1C1C1E',
          background_color: '#1C1C1E',
          display: 'standalone',
          orientation: 'portrait',
          dir: 'rtl',
          icons: [
            {
              src: 'https://api.dicebear.com/7.x/shapes/svg?seed=taamul&backgroundColor=007AFF',
              sizes: '192x192',
              type: 'image/svg+xml'
            },
            {
              src: 'https://api.dicebear.com/7.x/shapes/svg?seed=taamul&backgroundColor=007AFF',
              sizes: '512x512',
              type: 'image/svg+xml'
            },
            {
              src: 'https://api.dicebear.com/7.x/shapes/svg?seed=taamul&backgroundColor=007AFF',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ""),
      'process.env.FIREBASE_API_KEY': JSON.stringify(env.FIREBASE_API_KEY || (firebaseConfig as any).apiKey || ""),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(env.FIREBASE_AUTH_DOMAIN || (firebaseConfig as any).authDomain || ""),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(env.FIREBASE_PROJECT_ID || (firebaseConfig as any).projectId || ""),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(env.FIREBASE_STORAGE_BUCKET || (firebaseConfig as any).storageBucket || ""),
      'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.FIREBASE_MESSAGING_SENDER_ID || (firebaseConfig as any).messagingSenderId || ""),
      'process.env.FIREBASE_APP_ID': JSON.stringify(env.FIREBASE_APP_ID || (firebaseConfig as any).appId || ""),
      'process.env.FIREBASE_DATABASE_ID': JSON.stringify(env.FIREBASE_DATABASE_ID || (firebaseConfig as any).firestoreDatabaseId || ""),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
