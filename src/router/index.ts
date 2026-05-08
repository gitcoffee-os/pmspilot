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
  PmNotFound
} from '@gitcoffee/pmspilot-ui';

const routes = [
  {
    path: '/',
    component: PmMainLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: PmDashboard,
        meta: { title: '工作台' }
      },
      {
        path: 'todo',
        name: 'Todo',
        component: PmTodoView,
        meta: { title: '待办四象限' }
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: PmTaskList,
        meta: { title: '任务管理' }
      },
      {
        path: 'projects',
        name: 'Projects',
        component: PmProjectList,
        meta: { title: '项目管理' }
      },
      {
        path: 'team',
        name: 'Team',
        component: PmTeamView,
        meta: { title: '团队管理' }
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: PmProjectDetail,
        meta: { title: '项目详情' }
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: PmCalendarView,
        meta: { title: '日程管理' }
      },
      {
        path: 'gantt',
        name: 'Gantt',
        component: PmGanttView,
        meta: { title: '甘特图' }
      },
      {
        path: 'docs',
        name: 'Docs',
        component: PmDocsView,
        meta: { title: '文档库' }
      },
      {
        path: 'chat',
        name: 'Chat',
        component: PmChatView,
        meta: { title: '即时通讯' }
      },
      {
        path: 'chat-room',
        name: 'ChatRoom',
        component: PmChatRoomView,
        meta: { title: '聊天室' }
      },
      {
        path: 'report',
        name: 'Report',
        component: PmReportView,
        meta: { title: '周报/日报' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: PmSettingsView,
        meta: { title: '设置' }
      },
      {
        path: 'note',
        name: 'Note',
        component: PmNoteView,
        meta: { title: '笔记' }
      },
      {
        path: 'doc-editor',
        name: 'DocEditor',
        component: PmDocEditorView,
        meta: { title: '文档编辑器' }
      },
      {
        path: 'contacts',
        name: 'Contacts',
        component: PmContactsView,
        meta: { title: '通讯录' }
      },
      {
        path: 'file-manager',
        name: 'FileManager',
        component: PmFileManagerView,
        meta: { title: '文件管理' }
      },
      {
        path: 'sticky-note',
        name: 'StickyNote',
        component: PmStickyNoteView,
        meta: { title: '便签' }
      },
      {
        path: 'bookmark',
        name: 'Bookmark',
        component: PmBookmarkView,
        meta: { title: '书签' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: PmLoginView,
    meta: { title: '登录', public: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: PmNotFound,
    meta: { title: '页面未找到' }
  }
];

const router = createRouter({
  history: createWebHistory('/pms/'),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - PmsPilot` : 'PmsPilot 飞项';

  if (to.meta.public) {
    next();
    return;
  }

  const { authManager } = await import('@gitcoffee/auth');

  if (!authManager.isAuthenticated()) {
    authManager.setUserInfo({
      id: 'mock-user-001',
      username: 'developer',
      nickname: '开发者',
      avatar: '',
      email: 'dev@example.com'
    });
  }

  next();
});

export default router;
