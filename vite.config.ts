import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Rendrui',
      fileName: 'rendrui',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
  plugins: [
    cssInjectedByJsPlugin(), // Инлайнит CSS в JS
  ],
});
