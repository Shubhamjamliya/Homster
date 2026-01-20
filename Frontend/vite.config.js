import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime for smaller bundles
      jsxRuntime: 'automatic',
      // Fast refresh optimization
      fastRefresh: true,
    }),
    tailwindcss(),
  ],
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: http: https: http://localhost:* http://127.0.0.1:* http://localhost:5000 http://127.0.0.1:5000; font-src 'self' data: https:; connect-src 'self' https: ws: wss: http://localhost:* http://127.0.0.1:* http://localhost:5000 http://127.0.0.1:5000; frame-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self';"
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  build: {
    // Enable minification for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove specific console calls
      },
    },
    rollupOptions: {
      output: {
        // Aggressive code splitting for better caching
        manualChunks: (id) => {
          // Core vendor chunk (most stable)
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }

          // Router chunk (changes less frequently)
          if (id.includes('node_modules/react-router-dom')) {
            return 'router';
          }

          // Icons chunk (large but cacheable)
          if (id.includes('node_modules/react-icons')) {
            return 'icons';
          }

          // Animation libraries (lazy loaded)
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }

          // GSAP only for pages that use it (NOT vendor dashboard)
          if (id.includes('node_modules/gsap')) {
            return 'gsap-lazy';
          }

          // Toast notifications
          if (id.includes('node_modules/react-hot-toast')) {
            return 'toast';
          }

          // Socket.io chunk
          if (id.includes('node_modules/socket.io-client')) {
            return 'socket';
          }

          // Chart libraries
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }

          // Remaining node_modules
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600, // Reduced from 1000 to encourage smaller chunks
    // Disable sourcemaps in production for smaller builds
    sourcemap: false,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for smaller output
    target: 'es2020',
    // Optimize asset inlining
    assetsInlineLimit: 4096, // 4kb threshold
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster cold starts
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'react-hot-toast',
    ],
    // Exclude large deps that should be lazy loaded
    exclude: ['gsap'],
  },
  // Optimize HTML processing
  esbuild: {
    // Drop console and debugger in production
    drop: ['console', 'debugger'],
    // Minify identifiers
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
})