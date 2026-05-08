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
<template>
  <div class="app" :class="{ 'app--dark': isDark }">
    <router-view :logo-src="logoSrc" />
    <PmWatermark />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore, PmWatermark } from '@gitcoffee/pmspilot-ui';
import logoUrl from '/logo.svg?url';

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);
const logoSrc = logoUrl;
</script>
