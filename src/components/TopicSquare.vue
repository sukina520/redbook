<script setup>
import { useNotesStore } from '../stores/useNotesStore'

const store = useNotesStore()
</script>

<template>
  <section class="topic-page">
    <header class="page-heading">
      <div>
        <small class="eyebrow">话题广场</small>
        <h1>看看大家最近都在参与什么校园话题</h1>
      </div>
      <div class="tabs-row primary compact">
        <button :class="{ active: store.topicSort === 'hot' }" type="button" @click="store.setTopicSort('hot')">最热</button>
        <button :class="{ active: store.topicSort === 'latest' }" type="button" @click="store.setTopicSort('latest')">最新</button>
      </div>
    </header>

    <section class="topic-hero" v-if="store.selectedTopic">
      <img :src="store.selectedTopic.cover" :alt="store.selectedTopic.name" />
      <div>
        <span class="topic-flag">本周热门</span>
        <h2>{{ store.selectedTopic.name }}</h2>
        <p>{{ store.selectedTopic.description }}</p>
        <div class="topic-stats">
          <span>{{ store.selectedTopic.participants }} 人参与</span>
          <span>{{ store.selectedTopic.notes }} 篇笔记</span>
          <span>热度 {{ store.selectedTopic.heat }}</span>
        </div>
      </div>
    </section>

    <section class="topic-grid">
      <button
        v-for="topic in store.topics"
        :key="topic.id"
        type="button"
        class="topic"
        :class="{ active: store.selectedTopicId === topic.id }"
        @click="store.setSelectedTopic(topic.id)"
      >
        <h3>{{ topic.name }}</h3>
        <p>{{ topic.description }}</p>
        <div class="topic-meta">
          <span>{{ topic.participants }} 人参与</span>
          <span>{{ topic.notes }} 篇</span>
        </div>
      </button>
    </section>

    <section class="topic-note-list">
      <article v-for="note in store.topicNotes" :key="note.id" class="topic-note" @click="store.openDetail(note.id)">
        <img :src="note.cover" :alt="note.title" />
        <div>
          <h4>{{ note.title }}</h4>
          <p>{{ note.content }}</p>
          <div class="topic-note-meta">
            <span>{{ note.author }}</span>
            <span>{{ note.displayTime }}</span>
            <span>♡ {{ note.likes }}</span>
            <span>💬 {{ note.commentsCount }}</span>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>
