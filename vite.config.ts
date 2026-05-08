/**
 * Copyright (c) 2025-2099 GitCoffee All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isFastBuild = mode === 'fast';

  return {
    base: '/pms/',
    plugins: [vue()],
    resolve: {
      alias: {
        '~': resolve(__dirname, 'src'),
        '~/*': resolve(__dirname, 'src/*'),
        '@': resolve(__dirname, 'src'),
        '@/*': resolve(__dirname, 'src/*'),
        '@gitcoffee/pmspilot-ui': resolve(__dirname, '../../packages/ui/pms-ui/dist/index.js'),
        '@gitcoffee/pmspilot-ui/dist/index.css': resolve(__dirname, '../../packages/ui/pms-ui/dist/styles/index.css'),
        '@gitcoffee/api': resolve(__dirname, '../../packages/core/api/src/index.ts'),
        '@gitcoffee/api/auth': resolve(__dirname, '../../packages/core/api/src/api/auth/index.ts'),
        '@gitcoffee/auth': resolve(__dirname, '../../packages/core/auth/src/index.ts'),
        '@gitcoffee/pmspilot-utils': resolve(__dirname, '../../packages/utils/pmspilot-utils/src/index.ts'),
        '@gitcoffee/pmspilot-utils/auth': resolve(__dirname, '../../packages/utils/pmspilot-utils/src/auth/index.ts'),
        '@gitcoffee/pmspilot-utils/avatar': resolve(__dirname, '../../packages/utils/pmspilot-utils/src/avatar/index.ts'),
        '@gitcoffee/pmspilot-utils/date': resolve(__dirname, '../../packages/utils/pmspilot-utils/src/date/index.ts')
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: isFastBuild ? false : 'esbuild',
      esbuild: {
        drop: isFastBuild ? [] : ['console', 'debugger']
      },
      reportCompressedSize: true,
      cacheDir: './node_modules/.vite-cache',
      sourcemap: !isFastBuild,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          format: 'es',
          inlineDynamicImports: false,
          manualChunks: isFastBuild
            ? undefined
            : {
                vendor: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
                ui: ['@gitcoffee/pmspilot-ui'],
                utils: ['@gitcoffee/pmspilot-utils']
              }
        }
      },
      assetsDir: 'assets'
    },
    server: {
      port: 5174,
      open: false,
      fs: {
        strict: false
      },
      watch: {
        ignored: ['**/node_modules/**', '**/dist/**']
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    }
  };
});
