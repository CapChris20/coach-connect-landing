// vite.config.js — build setup for the Coach Connect site.
// envPrefix keeps the old site's REACT_APP_FIREBASE_* keys working, so the
// same .env.local can be copied over unchanged.
// three.js and Firebase are split out by the lazy imports in the pages, so the
// homepage's first paint never waits on them.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' (artifact build only) makes every asset URL relative to the page.
export default defineConfig({
  base: process.env.VITE_ARTIFACT ? './' : '/',
  plugins: [react()],
  envPrefix: ['VITE_', 'REACT_APP_'],
  build: { chunkSizeWarningLimit: 1200 },
});
