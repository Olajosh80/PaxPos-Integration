import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from the root directory
  const env = loadEnv(mode, path.resolve(__dirname, '../../'), '');

  // Get ports from environment variables or use defaults
  const frontendPort = parseInt(env.FRONTEND_PORT || '3000', 10);
  const backendPort = parseInt(env.BACKEND_PORT || '3001', 10);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Make environment variables available to the frontend
    define: {
      __PAX_TERMINAL_IP__: JSON.stringify(env.PAX_TERMINAL_IP || '192.168.178.24'),
      __PAX_TERMINAL_PORT__: JSON.stringify(env.PAX_TERMINAL_PORT || '10009'),
      __BACKEND_PORT__: JSON.stringify(backendPort),
      __FRONTEND_PORT__: JSON.stringify(frontendPort),
      __NODE_ENV__: JSON.stringify(env.NODE_ENV || 'development'),
    },
    server: {
      port: frontendPort,
      proxy: {
        // Proxy API requests to the backend during development
        // This avoids CORS issues and mimics a production setup where
        // frontend and backend might be served from the same domain.
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ''), // if backend doesn't have /api prefix
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true, // Generate source maps for production builds
    },
    // optimizeDeps: {
    //   include: ['shared-types'], // If shared-types is a local package, Vite might need this hint
    // },
  };
});
