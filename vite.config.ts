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
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { createApiTargetSwitcher } from '../../packages/ui/debug-ui/src/vite';

// 代理目标持久化文件（调试面板运行时切换后写入，重启后保持）
const API_TARGET_FILE = resolve(__dirname, '.pms-api-target');

export default defineConfig(({ mode }) => {
  const isFastBuild = mode === 'fast';
  const isDev = mode !== 'production' && mode !== 'fast';
  // 本地调试可指向远程后端（如 https://pmspilot.exmay.com），默认本地 8080
  // 优先级：调试面板持久化值 > 环境变量 VITE_API_PROXY_TARGET > http://localhost:8080
  const env = loadEnv(mode, process.cwd(), '');
  // 通用调试面板：dev 中间件 + 代理目标运行时切换（持久化到 .pms-api-target）
  const apiTargetSwitcher = createApiTargetSwitcher({
    endpoint: '/__pms/api-target',
    targetFile: API_TARGET_FILE,
    defaultTarget: env.VITE_API_PROXY_TARGET || 'http://localhost:8080'
  });
  const apiProxyTarget = apiTargetSwitcher.getTarget();

  return {
    base: '/pms/',
    plugins: [vue(), apiTargetSwitcher.plugin],
    resolve: {
      alias: {
        '~': resolve(__dirname, 'src'),
        '~/*': resolve(__dirname, 'src/*'),
        '@': resolve(__dirname, 'src'),
        '@/*': resolve(__dirname, 'src/*'),
        // 子路径别名必须放在包名别名之前，否则会被包名前缀匹配吞掉
        '@gitcoffee-os/pmspilot-ui/styles': isDev
          ? resolve(__dirname, '../../packages/aircenter-engine/air-design/pmspilot-ui/src/styles/index.css')
          : resolve(__dirname, '../../packages/aircenter-engine/air-design/pmspilot-ui/dist/index.css'),
        '@gitcoffee-os/pmspilot-ui/dist/index.css': isDev
          ? resolve(__dirname, '../../packages/aircenter-engine/air-design/pmspilot-ui/src/styles/index.css')
          : resolve(__dirname, '../../packages/aircenter-engine/air-design/pmspilot-ui/dist/index.css'),
        '@gitcoffee-os/api/auth': resolve(__dirname, '../../packages/core/api/src/api/auth/index.ts'),
        '@gitcoffee-os/exmay-adapter/components/EditorBot.vue': resolve(__dirname, '../../packages/core/exmay-adapter/src/components/EditorBot.vue'),
        // exmay-adapter/dist 引用 @ant-design/icons-vue，但该包未在 exmay-adapter 声明依赖，需固定到本应用安装的副本
        '@ant-design/icons-vue': resolve(__dirname, 'node_modules/@ant-design/icons-vue'),
        '@gitcoffee-os/pmspilot-authority-api': resolve(__dirname, '../../packages/aircenter-engine/air-api/pmspilot-authority-api/src/index.ts'),
        '@gitcoffee-os/agioffice': resolve(__dirname, '../../packages/file-engine/agioffice/src'),
        '@gitcoffee-os/flowchart': resolve(__dirname, '../../packages/file-engine/flowchart/src'),
        '@gitcoffee-os/pmspilot-utils/auth': resolve(__dirname, '../../packages/aircenter-engine/air-utils/pmspilot-utils/src/auth/index.ts'),
        '@gitcoffee-os/pmspilot-utils/avatar': resolve(__dirname, '../../packages/aircenter-engine/air-utils/pmspilot-utils/src/avatar/index.ts'),
        '@gitcoffee-os/pmspilot-utils/date': resolve(__dirname, '../../packages/aircenter-engine/air-utils/pmspilot-utils/src/date/index.ts'),
        '@gitcoffee-os/pmspilot-utils/format': resolve(__dirname, '../../packages/aircenter-engine/air-utils/pmspilot-utils/src/format/index.ts'),
        '@gitcoffee-os/pmspilot-utils/markdown': resolve(__dirname, '../../packages/aircenter-engine/air-utils/pmspilot-utils/src/markdown/index.ts'),
        '@gitcoffee-os/pmspilot-ui': isDev
          ? resolve(__dirname, '../../packages/aircenter-engine/air-design/pmspilot-ui/src/index.ts')
          : resolve(__dirname, '../../packages/aircenter-engine/air-design/pmspilot-ui/dist/index.js'),
        // 通用调试面板：跟随 pmspilot-ui 的 dev/build 源码解析方式
        '@gitcoffee-os/debug-ui': resolve(__dirname, '../../packages/ui/debug-ui/src/index.ts'),
        '@gitcoffee-os/api': resolve(__dirname, '../../packages/core/api/src/index.ts'),
        '@gitcoffee-os/auth': resolve(__dirname, '../../packages/core/auth/src/index.ts'),
        '@gitcoffee-os/pmspilot-utils': resolve(__dirname, '../../packages/aircenter-engine/air-utils/pmspilot-utils/src/index.ts')
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
        // 应用 base 为 /pms/，前端请求路径实际为 /pms/api / /pms/exmay，**命中代理后需剥离 /pms/ 前缀，避免转发到生产后端**
        '/pms/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/pms/, ''),
          configure: apiTargetSwitcher.onProxyCreated
        },
        // exmay-oa-engine 后端接口（/exmay/admin/api/oa/**），前端请求路径为 /pms/exmay/...
        '/pms/exmay': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/pms/, ''),
          configure: apiTargetSwitcher.onProxyCreated
        }
      }
    }
  };
});
