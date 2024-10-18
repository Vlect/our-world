import restart from 'vite-plugin-restart'
import glsl from 'vite-plugin-glsl'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default {
    root: 'src/',
    publicDir: '../static/',
    base: './',
    server: {
        host: true,
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env)
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                main: 'src/index.html',
                world: 'src/world.html',
            },
        },
    },
    plugins: [
        restart({ restart: ['../static/**'] }),
        glsl(),
        viteStaticCopy({
            targets: [
                { src: '../src/world.html', dest: '' },
                { src: '../src/world.js', dest: '' },
                { src: '../src/style.css', dest: '' },
            ],
        }),
    ],
    optimizeDeps: {
        include: ['lil-gui'], // Ensure `lil-gui` is included in the bundle
    },
};

