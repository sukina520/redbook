<script setup>
import { ref } from 'vue'
import { useNotesStore } from '../stores/useNotesStore'

const store = useNotesStore()
const commentDraft = ref({})

function submitComment(noteId) {
  const text = commentDraft.value[noteId]?.trim()
  if (!text) return
  store.addComment(noteId, text)
  commentDraft.value[noteId] = ''
}
</script>

<template>
  <section class="card">
    <h2>首页推荐流</h2>
    <div class="feed-controls">
      <button :class="['chip', { active: store.activeTab === 'recommend' }]" @click="store.activeTab = 'recommend'">推荐</button>
      <button :class="['chip', { active: store.activeTab === 'hot' }]" @click="store.activeTab = 'hot'">校园热门</button>
      <select v-model="store.activeTag">
        <option>全部</option>
        <option v-for="tag in store.availableTags" :key="tag">{{ tag }}</option>
      </select>
    </div>

    <article class="note-card" v-for="note in store.feedNotes" :key="note.id">
      <header>
        <strong>{{ note.title }}</strong>
        <small>{{ note.author }}</small>
      </header>
      <p>{{ note.content }}</p>
      <p class="tags">#{{ note.tags.join(' #') }}</p>
      <img v-if="note.type === 'image'" :src="note.media[0]" alt="笔记图片" />
      <video v-else controls :src="note.media[0]"></video>
      <p v-if="note.subtitle" class="subtitle">字幕：{{ note.subtitle }}</p>
      <div class="actions">
        <button @click="store.toggleLike(note.id)">👍 {{ note.likes }}</button>
        <button @click="store.toggleFavorite(note.id)">⭐ {{ note.favorites }}</button>
      </div>
      <div class="comment-box">
        <input v-model="commentDraft[note.id]" placeholder="评论一下..." @keyup.enter="submitComment(note.id)" />
        <button @click="submitComment(note.id)">发送</button>
      </div>
      <ul>
        <li v-for="item in note.comments" :key="item.id">
          <template v-if="!item.deleted">
            <span>{{ item.author }}：{{ item.content }}</span>
            <button class="link" @click="store.deleteComment(note.id, item.id)">删除</button>
          </template>
          <span v-else class="deleted">该评论已删除</span>
        </li>
      </ul>
    </article>
  </section>
</template>
