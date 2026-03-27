<script setup>
import { useNotesStore } from '../stores/useNotesStore'

const store = useNotesStore()

const navItems = [
  { key: 'discover', icon: '⌂', label: '发现', enabled: true },
  { key: 'topics', icon: '#', label: '话题', enabled: true },
  { key: 'publish', icon: '+', label: '发布', enabled: true },
  { key: 'notify', icon: '◌', label: '通知', enabled: false },
  { key: 'profile', icon: '◍', label: '我', enabled: true }
]

function handleClick(item) {
  if (!item.enabled) return
  store.switchView(item.key)
}
</script>

<template>
  <aside class="left-sidebar">
    <div class="brand-panel">
      <div class="brand">校园红书</div>
      <p>记录真实校园生活，分享同校灵感。</p>
    </div>

    <nav class="left-nav">
      <button
        v-for="item in navItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: store.currentView === item.key, disabled: !item.enabled }"
        type="button"
        @click="handleClick(item)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
        <small v-if="!item.enabled">即将开放</small>
      </button>
    </nav>

    <section class="profile-mini">
      <img :src="store.userProfile.avatar" :alt="store.userProfile.name" />
      <div>
        <strong>{{ store.userProfile.name }}</strong>
        <p>{{ store.userProfile.tags.join(' / ') }}</p>
      </div>
    </section>
  </aside>
</template>
