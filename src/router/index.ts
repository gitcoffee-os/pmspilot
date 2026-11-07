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

import type { Component } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import {
  PmMainLayout,
  PmDashboard,
  PmTodoView,
  PmTaskList,
  PmProjectList,
  PmTeamView,
  PmProjectDetail,
  PmCalendarView,
  PmGanttView,
  PmDocsView,
  PmChatView,
  PmChatRoomView,
  PmReportView,
  PmSettingsView,
  PmNoteView,
  PmDocEditorView,
  PmContactsView,
  PmFileManagerView,
  PmStickyNoteView,
  PmBookmarkView,
  PmLoginView,
  PmNotFound,
  flatNavItems
} from '@gitcoffee-os/pmspilot-ui';
import { isLoggedIn } from '@gitcoffee-os/pmspilot-utils/auth';

/** 路由名 -> 页面组件 */
const componentMap: Record<string, Component> = {
  Dashboard: PmDashboard,
  Todo: PmTodoView,
  Tasks: PmTaskList,
  Projects: PmProjectList,
  Team: PmTeamView,
  Calendar: PmCalendarView,
  Gantt: PmGanttView,
  Docs: PmDocsView,
  Chat: PmChatView,
  Report: PmReportView,
  Contacts: PmContactsView,
  StickyNote: PmStickyNoteView,
  Bookmark: PmBookmarkView,
  Note: PmNoteView,
  DocEditor: PmDocEditorView,
  FileManager: PmFileManagerView
};

/** 由导航配置生成的布局内路由 */
const navRoutes = flatNavItems
  .filter(item => componentMap[item.key])
  .map(item => ({
    path: item.path,
    name: item.key,
    component: componentMap[item.key],
    meta: { title: item.label, subtitle: item.subtitle }
  }));

/** 不在导航菜单中、但需要布局的路由 */
const extraRoutes = [
  {
    path: 'projects/:id',
    name: 'ProjectDetail',
    component: PmProjectDetail,
    meta: { title: '项目详情' }
  },
  {
    path: 'chat-room',
    name: 'ChatRoom',
    component: PmChatRoomView,
    meta: { title: '聊天室' }
  },
  {
    path: 'settings',
    name: 'Settings',
    component: PmSettingsView,
    meta: { title: '设置' }
  }
];

const routes = [
  {
    path: '/',
    component: PmMainLayout,
    children: [
      ...navRoutes,
      ...extraRoutes,
      {
        path: ':pathMatch(.*)*',
        name: 'NotFound',
        component: PmNotFound,
        meta: { title: '页面未找到' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: PmLoginView,
    meta: { title: '登录', public: true }
  }
];

const router = createRouter({
  history: createWebHistory('/pms/'),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - PmsPilot` : 'PmsPilot 飞项';

  const loggedIn = isLoggedIn();

  // 已登录用户访问登录页时直接进入系统
  if (to.name === 'Login') {
    if (loggedIn) {
      const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/';
      next(redirect);
      return;
    }
    next();
    return;
  }

  if (to.meta.public) {
    next();
    return;
  }

  if (!loggedIn) {
    next({
      name: 'Login',
      query: to.fullPath === '/' ? undefined : { redirect: to.fullPath }
    });
    return;
  }

  next();
});

export default router;
