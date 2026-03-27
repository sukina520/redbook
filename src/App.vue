<script setup>
import { computed, onMounted } from 'vue'
import LeftSidebar from './components/LeftSidebar.vue'
import MainFeed from './components/MainFeed.vue'
import PublishPanel from './components/PublishPanel.vue'
import RightSidebar from './components/RightSidebar.vue'
import TopicSquare from './components/TopicSquare.vue'
import ProfilePanel from './components/ProfilePanel.vue'
import NoteDetailModal from './components/NoteDetailModal.vue'
import LoginModal from './components/LoginModal.vue'
import { useNotesStore } from './stores/useNotesStore'

const store = useNotesStore()

onMounted(() => {
  store.initialize()
})

const mobileNav = [
  { key: 'discover', label: '发现' },
  { key: 'publish', label: '发布' },
  { key: 'topics', label: '话题' },
  { key: 'profile', label: '我的' }
]

const currentComponent = computed(() => {
  if (store.currentView === 'publish') return PublishPanel
  if (store.currentView === 'topics') return TopicSquare
  if (store.currentView === 'profile') return ProfilePanel
  return MainFeed
})
</script>

<template>
  <div class="layout-shell">
    <LeftSidebar />
    <div class="layout">
      <main class="page-main">
        <component :is="currentComponent" />
      </main>
      <RightSidebar />
    </div>

    <nav class="mobile-nav">
      <button
        v-for="item in mobileNav"
        :key="item.key"
        type="button"
        :class="{ active: store.currentView === item.key }"
        @click="store.switchView(item.key)"
      >
        {{ item.label }}
      </button>
    </nav>

    <LoginModal v-if="!store.authState.isAuthenticated" />
    <NoteDetailModal />
  </div>
</template>
