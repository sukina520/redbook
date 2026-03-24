<script setup>
import { computed, ref } from 'vue'
import { useNotesStore } from '../stores/useNotesStore'

const store = useNotesStore()

const searchText = ref('codex')
const typeTab = ref('all')
const category = ref('综合')
const openedNote = ref(null)

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'image', label: '图文' },
  { key: 'video', label: '视频' },
  { key: 'user', label: '用户' }
]

const subCategories = ['综合', '使用教程', '免费额度', '安装包', '价格', '登录', '配置', '模型选择', '代码']

const cardList = computed(() => {
  if (typeTab.value === 'user') return []

  return store.feedNotes
    .filter((note) => (typeTab.value === 'all' ? true : note.type === typeTab.value))
    .filter((note) => {
      if (!searchText.value.trim()) return true
      const keyword = searchText.value.trim().toLowerCase()
      return `${note.title}${note.content}${note.tags.join('')}`.toLowerCase().includes(keyword)
    })
    .map((note) => ({
      ...note,
      cover: note.media[0],
      commentsCount: note.comments.filter((item) => !item.deleted).length
    }))
})

function openDetail(note) {
  openedNote.value = note
}

function closeDetail() {
  openedNote.value = null
}

function likeNote(noteId) {
  store.toggleLike(noteId)
  if (openedNote.value?.id === noteId) {
    openedNote.value = store.feedNotes.find((note) => note.id === noteId) || null
  }
}

function formatCount(value) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`
  return String(value)
}
</script>

<template>
  <main class="main-area">
    <header class="top-header">
      <div class="search-wrap">
        <input v-model="searchText" type="text" placeholder="搜索内容" />
        <span class="search-icon">⌕</span>
      </div>
      <div class="header-links">
        <a href="#">创作中心</a>
        <a href="#">业务合作</a>
      </div>
    </header>

    <section class="tabs-row primary">
      <button v-for="tab in tabs" :key="tab.key" type="button" :class="{ active: typeTab === tab.key }" @click="typeTab = tab.key">
        {{ tab.label }}
      </button>
      <span class="filter-link">筛选 ▾</span>
    </section>

    <section class="tabs-row secondary">
      <button
        v-for="item in subCategories"
        :key="item"
        type="button"
        class="chip"
        :class="{ active: category === item }"
        @click="category = item"
      >
        {{ item }}
      </button>
    </section>

    <section v-if="typeTab === 'user'" class="empty-users">
      <h3>用户搜索结果</h3>
      <p>当前关键词“{{ searchText }}”暂无用户示例数据。</p>
    </section>

    <section v-else class="masonry">
      <article v-for="note in cardList" :key="note.id" class="water-card" @click="openDetail(note)">
        <div class="cover-box">
          <img :src="note.cover" :alt="note.title" loading="lazy" />
          <span v-if="note.type === 'video'" class="video-tag">▶ 视频</span>
        </div>
        <div class="card-body">
          <h4>{{ note.title }}</h4>
          <div class="author-row">
            <span>{{ note.author }}</span>
            <button type="button" class="like-btn" @click.stop="likeNote(note.id)">♡ {{ formatCount(note.likes) }}</button>
          </div>
        </div>
      </article>
    </section>

    <div class="detail-mask" :class="{ show: !!openedNote }" @click.self="closeDetail">
      <article v-if="openedNote" class="detail-modal">
        <img :src="openedNote.cover || openedNote.media?.[0]" :alt="openedNote.title" />
        <div class="detail-content">
          <h3>{{ openedNote.title }}</h3>
          <p>{{ openedNote.content }}</p>
          <div class="detail-stats">
            <span>♡ {{ formatCount(openedNote.likes) }}</span>
            <span>💬 {{ formatCount(openedNote.commentsCount || 0) }}</span>
          </div>
          <button type="button" class="close-btn" @click="closeDetail">关闭</button>
        </div>
      </article>
    </div>
  </main>
</template>
