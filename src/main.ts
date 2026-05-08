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
import '@gitcoffee/pmspilot-ui/styles';

// Import UI components and styles
import DesignUI from '@gitcoffee/design-ui';

import { configureAuth, type UserInfo as AuthUserInfo } from '@gitcoffee/auth';
import { initApiClient, setTokenGetter } from '@gitcoffee/api';
import { getToken, getUserInfo, clearAuth } from '@gitcoffee/pmspilot-utils/auth';

// Import locales
import zh from './locales/zh.json';
import en from './locales/en.json';

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    zh,
    en
  }
});

setTokenGetter(() => getToken() || null);

initApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  adapterType: 'fetch',
  autoDetect: true,
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

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(DesignUI);

app.mount('#app');
