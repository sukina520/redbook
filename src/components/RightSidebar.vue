<script setup>
import { useNotesStore } from '../stores/useNotesStore'

const store = useNotesStore()
</script>

<template>
  <aside class="right-sidebar">
    <section class="trend-card">
      <div class="section-title">
        <h3>大家都在搜</h3>
        <span>校园热度</span>
      </div>
      <ul>
        <li v-for="item in store.campusTrends" :key="item.keyword">
          <span>{{ item.keyword }}</span>
          <small>{{ item.heat }}</small>
        </li>
      </ul>
    </section>

    <section class="topic-card">
      <div class="section-title">
        <h3>热门话题</h3>
        <button type="button" class="link-btn" @click="store.switchView('topics')">查看全部</button>
      </div>
      <button
        v-for="topic in store.featuredTopics"
        :key="topic.id"
        type="button"
        class="topic-preview"
        @click="store.setSelectedTopic(topic.id)"
      >
        <img :src="topic.cover" :alt="topic.name" />
        <div>
          <strong>{{ topic.name }}</strong>
          <p>{{ topic.participants }} 人参与 · {{ topic.notes }} 篇笔记</p>
        </div>
      </button>
    </section>
  </aside>
</template>
