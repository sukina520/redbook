<script setup>
import { useNotesStore } from '../stores/useNotesStore'

const store = useNotesStore()

const feedModes = [
  { key: 'recommend', label: '推荐' },
  { key: 'hot', label: '校园热门' },
  { key: 'latest', label: '最新' },
  { key: 'user', label: '用户' }
]

function openNote(noteId) {
  store.openDetail(noteId)
}

function toggleLike(noteId) {
  store.toggleLike(noteId)
}

function toggleFavorite(noteId) {
  store.toggleFavorite(noteId)
}
</script>

<template>
  <section class="discover-page">
    <header class="discover-hero">
      <div>
        <small class="eyebrow">校园轻社区</small>
        <h1>把这周校园里值得说的事，都记下来。</h1>
        <p>支持图文、短视频、话题参与和互动评论，首页会按你的兴趣持续更新。</p>
      </div>
      <button type="button" class="primary large" @click="store.switchView('publish')">马上发布</button>
    </header>

    <section class="top-header">
      <div class="search-wrap">
        <input
          :value="store.searchText"
          type="text"
          placeholder="搜索校园生活、话题或作者"
          @input="store.setSearchText($event.target.value)"
        />
        <span class="search-icon">⌕</span>
      </div>
    </section>

    <section class="tabs-row primary">
      <button
        v-for="tab in feedModes"
        :key="tab.key"
        type="button"
        :class="{ active: store.feedMode === tab.key }"
        @click="store.setFeedMode(tab.key)"
      >
        {{ tab.label }}
      </button>
    </section>

    <section class="tabs-row secondary">
      <button
        v-for="tag in ['全部', ...store.availableTags]"
        :key="tag"
        type="button"
        class="chip"
        :class="{ active: store.activeTag === tag }"
        @click="store.setActiveTag(tag)"
      >
        {{ tag }}
      </button>
    </section>

    <section v-if="store.feedMode === 'user'" class="empty-users">
      <h3>校园用户搜索暂未开放</h3>
      <p>当前版本先支持内容搜索，后续会接入真实用户检索能力。</p>
    </section>

    <section v-else-if="store.feedNotes.length" class="masonry">
      <article v-for="note in store.feedNotes" :key="note.id" class="water-card" @click="openNote(note.id)">
        <div class="cover-box">
          <img :src="note.cover" :alt="note.title" loading="lazy" />
          <span v-if="note.type === 'video'" class="video-tag">▶ 视频</span>
          <span class="topic-badge">{{ note.topicName }}</span>
        </div>
        <div class="card-body">
          <h4>{{ note.title }}</h4>
          <p class="card-copy">{{ note.content }}</p>
          <div class="card-tags">
            <span v-for="tag in note.tags" :key="tag">#{{ tag }}</span>
          </div>
          <div class="author-row">
            <div>
              <strong>{{ note.author }}</strong>
              <span>{{ note.displayTime }}</span>
            </div>
            <div class="inline-actions">
              <button type="button" class="icon-btn" :class="{ active: note.isLiked }" @click.stop="toggleLike(note.id)">
                ♡ {{ note.likes }}
              </button>
              <button type="button" class="icon-btn" :class="{ active: note.isFavorited }" @click.stop="toggleFavorite(note.id)">
                ☆ {{ note.favorites }}
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section v-else class="empty-users">
      <h3>还没有匹配到内容</h3>
      <p>换个关键词或者标签试试，或者先发布你的第一篇校园笔记。</p>
    </section>
  </section>
</template>
