import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    globals: true
  },
  resolve: {
    alias: {
      // Exclude Node.js-only files from browser builds
      './protobuf.node.js': './protobuf.node.ts'
    }
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Don't bundle protobuf.node in browser builds
        return id.includes('protobuf.node');
      }
    }
  }
});
