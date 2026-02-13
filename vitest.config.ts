/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // importantíssimo para testes React
    globals: true, // permite usar expect(), describe(), it() sem importar
    setupFiles: './src/tests/setupTests.ts', // seu setupTests.ts
  },
});
