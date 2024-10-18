import { defineConfig } from 'vite';
import restart from 'vite-plugin-restart';
import glsl from 'vite-plugin-glsl';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'src/',  // Set the source folder as root
  publicDir: '../static/',  // Static assets location
  base: './',  // Ensure paths are relative
  server: {
    host: true,  // Allow network access for local testing
    open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env),  // Open browser on start unless in a sandbox
  },
  build: {
    outDir: '../dist',  // Output to the dist folder
    emptyOutDir: true,  // Clean the output directory before building
    sourcemap: true,  // Generate sourcemaps for debugging
    rollupOptions: {
      // Treat both index.html and world.html as entry points
      input: {
        main: 'src/index.html',
        world: 'src/world.html',
      },
    },
  },
  plugins: [
    restart({
      restart: ['../static/**'],  // Restart server when static files change
    }),
    glsl(),  // Handle GLSL shader imports
    viteStaticCopy({
      targets: [
        // Copy world.js and any other static files you need
        { src: 'world.js', dest: '' },
        { src: 'style.css', dest: '' },
      ],
    }),
  ],
  optimizeDeps: {
    // Ensure lil-gui is bundled properly
    include: ['lil-gui'],
  },
});

