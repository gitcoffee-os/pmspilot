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

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import '@gitcoffee-os/pmspilot-ui/styles';

// Import UI components and styles
import DesignUI from '@gitcoffee-os/design-ui';

import { configureAuth, type UserInfo as AuthUserInfo } from '@gitcoffee-os/auth';
import { initApiClient, updateApiHeaders, setTokenGetter, mock } from '@gitcoffee-os/api';
import { getToken, getUserInfo, clearAuth } from '@gitcoffee-os/pmspilot-utils/auth';
import { useThemeStore, useAppSettingsStore, getDataSource, isMockSource, createPmsFileApiConfig, DebugPlugin } from '@gitcoffee-os/pmspilot-ui';
import { setFileKitConfig } from '@gitcoffee-os/file-kit';

// Import locales
import zh from './locales/zh.json';
import en from './locales/en.json';

const { mockService } = mock;

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    zh,
    en
  }
});

// 统一数据源：VITE_DATA_SOURCE=api | mock | local，未设置时开发环境默认 mock，生产默认 api
const dataSource = getDataSource();
if (isMockSource(dataSource)) {
  mockService.enable({ delay: 200 });
}

setTokenGetter(() => getToken() || null);

initApiClient({
  // Vite dev server base 为 /pms/，API 请求需带同前缀才能命中 vite 代理（/pms/exmay、/pms/api）
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/pms',
  // 后端要求携带 App-Id 请求头（默认应用名，可通过 VITE_APP_ID 覆盖）
  headers: { 'App-Id': import.meta.env.VITE_APP_ID || 'pmspilot' },
  adapterType: 'fetch',
  autoDetect: true,
});

// 页面刷新时从本地恢复 Authorization（登录后由 LoginView 更新，登出时清除）
const storedToken = getToken();
if (storedToken) {
  updateApiHeaders({ Authorization: `Bearer ${storedToken}` });
}

// 文件能力层（file-kit）初始化：统一文件契约 + 上传/预览组件全局配置
// 上传走 /api/v1/upload/multipart（cookie session 鉴权，withCredentials 开启）
setFileKitConfig({
  apiConfig: createPmsFileApiConfig(),
  paramConfig: { categoryId: 'folderId' },
  withCredentials: true,
});

configureAuth({
  loginUrl: '/auth/login',
  homeUrl: '/',
  loadUserInfoHandler: async (): Promise<AuthUserInfo | null> => {
    const userInfo = getUserInfo();
    if (!userInfo) return null;
    return {
      ...userInfo,
      name: userInfo.nickname || userInfo.username,
      roles: [],
      permissions: [],
    };
  },
  logoutHandler: async () => {
    clearAuth();
  }
});

const app = createApp(App);

// Dev 环境登录 bypass 标记：无需后端即可登录，便于本地预览内页
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).__PM_DEV_LOGIN__ = true;
}

const pinia = createPinia();

app.use(pinia);
app.use(DebugPlugin);

// 主题与语言需要在挂载前初始化，避免首屏闪烁
const themeStore = useThemeStore(pinia);
themeStore.init();
const settingsStore = useAppSettingsStore(pinia);
settingsStore.init();
i18n.global.locale.value = settingsStore.locale;

app.use(router);
app.use(i18n);
app.use(DesignUI);

app.mount('#app');
