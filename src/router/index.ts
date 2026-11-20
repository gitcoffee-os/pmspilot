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
  PmTodo,
  PmTaskList,
  PmProjectList,
  PmTeam,
  PmProjectDetail,
  PmCalendarPage,
  PmGantt,
  PmKnowledge,
  PmKnowledgeEdit,
  PmChat,
  PmChatRoom,
  PmReport,
  PmSettings,
  PmNote,
  PmDocs,
  PmDocEditor,
  PmContacts,
  PmFileManager,
  PmMemo,
  PmBookmark,
  PmLogin,
  PmRegister,
  PmForgotPassword,
  PmNotFound,
  flatNavItems
} from '@gitcoffee-os/pmspilot-ui';
import { isLoggedIn } from '@gitcoffee-os/pmspilot-utils/auth';

/** 路由名 -> 页面组件 */
const componentMap: Record<string, Component> = {
  Dashboard: PmDashboard,
  Todo: PmTodo,
  Tasks: PmTaskList,
  Projects: PmProjectList,
  Team: PmTeam,
  Calendar: PmCalendarPage,
  Gantt: PmGantt,
  KnowledgeBase: PmKnowledge,
  Chat: PmChat,
  Report: PmReport,
  Contacts: PmContacts,
  Memo: PmMemo,
  Bookmark: PmBookmark,
  Note: PmNote,
  Docs: PmDocs,
  FileManager: PmFileManager
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
    component: PmChatRoom,
    meta: { title: '聊天室' }
  },
  {
    // 独立文档编辑器：不在菜单中，由 /pms/docs 列表页携带 id 进入
    path: 'doc-editor',
    name: 'DocEditor',
    component: PmDocEditor,
    meta: { title: '文档编辑器' }
  },
  {
    // 知识库章节独立编辑页：不在菜单中，由 /pms/knowledge 列表页携带 knowledgeId+sectionId 进入
    path: 'knowledge-edit',
    name: 'KnowledgeEdit',
    component: PmKnowledgeEdit,
    meta: { title: '章节编辑' }
  },
  {
    path: 'settings',
    name: 'Settings',
    component: PmSettings,
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
    component: PmLogin,
    meta: { title: '登录', public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: PmRegister,
    meta: { title: '注册', public: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: PmForgotPassword,
    meta: { title: '找回密码', public: true }
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
  document.title = to.meta.title ? `${to.meta.title} - PmsPilot` : 'PmsPilot 项导';

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
