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
  const isDev = mode !== 'production' && mode !== 'fast';

  return {
    base: '/pms/',
    plugins: [vue()],
    resolve: {
      alias: {
        '~': resolve(__dirname, 'src'),
        '~/*': resolve(__dirname, 'src/*'),
        '@': resolve(__dirname, 'src'),
        '@/*': resolve(__dirname, 'src/*'),
        // 子路径别名必须放在包名别名之前，否则会被包名前缀匹配吞掉
        '@gitcoffee-os/pmspilot-ui/styles': isDev
          ? resolve(__dirname, '../../packages/ui/pmspilot-ui/src/styles/index.css')
          : resolve(__dirname, '../../packages/ui/pmspilot-ui/dist/index.css'),
        '@gitcoffee-os/pmspilot-ui/dist/index.css': isDev
          ? resolve(__dirname, '../../packages/ui/pmspilot-ui/src/styles/index.css')
          : resolve(__dirname, '../../packages/ui/pmspilot-ui/dist/index.css'),
        '@gitcoffee-os/api/auth': resolve(__dirname, '../../packages/core/api/src/api/auth/index.ts'),
        '@gitcoffee-os/pmspilot-utils/auth': resolve(__dirname, '../../packages/utils/pmspilot-utils/src/auth/index.ts'),
        '@gitcoffee-os/pmspilot-utils/avatar': resolve(__dirname, '../../packages/utils/pmspilot-utils/src/avatar/index.ts'),
        '@gitcoffee-os/pmspilot-utils/date': resolve(__dirname, '../../packages/utils/pmspilot-utils/src/date/index.ts'),
        '@gitcoffee-os/pmspilot-ui': isDev
          ? resolve(__dirname, '../../packages/ui/pmspilot-ui/src/index.ts')
          : resolve(__dirname, '../../packages/ui/pmspilot-ui/dist/index.js'),
        '@gitcoffee-os/api': resolve(__dirname, '../../packages/core/api/src/index.ts'),
        '@gitcoffee-os/auth': resolve(__dirname, '../../packages/core/auth/src/index.ts'),
        '@gitcoffee-os/pmspilot-utils': resolve(__dirname, '../../packages/utils/pmspilot-utils/src/index.ts')
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
            : (id) => {
                if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia') || id.includes('vue-i18n')) {
                  return 'vendor';
                }
                if (id.includes('@gitcoffee-os/pmspilot-ui')) {
                  return 'ui';
                }
                if (id.includes('@gitcoffee-os/pmspilot-utils')) {
                  return 'utils';
                }
              },
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
        },
        // exmay-oa-engine 后端接口（/exmay/admin/api/oa/**）
        '/exmay': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    }
  };
});
