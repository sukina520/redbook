<script setup>
import { computed, ref } from 'vue'
import { useNotesStore } from '../stores/useNotesStore'

const store = useNotesStore()
const sortType = ref('hot')

const sortedTopics = computed(() => {
  const list = [...store.topics]
  if (sortType.value === 'latest') return list.sort((a, b) => b.id - a.id)
  return list.sort((a, b) => b.heat - a.heat)
})
</script>

<template>
  <section class="card">
    <h2>校园本地话题广场</h2>
    <div class="feed-controls">
      <button :class="['chip', { active: sortType === 'hot' }]" @click="sortType = 'hot'">最热</button>
      <button :class="['chip', { active: sortType === 'latest' }]" @click="sortType = 'latest'">最新</button>
    </div>
    <div class="topic-grid">
      <div class="topic" v-for="topic in sortedTopics" :key="topic.id">
        <h3>{{ topic.name }}</h3>
        <p>参与人数：{{ topic.participants }}</p>
        <p>笔记总数：{{ topic.notes }}</p>
      </div>
    </div>
  </section>
</template>
