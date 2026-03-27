<script setup>
import { computed, ref } from 'vue'
import { useNotesStore } from '../stores/useNotesStore'

const store = useNotesStore()
const commentDraft = ref('')
const replyTarget = ref(null)

const groupedComments = computed(() => {
  if (!store.openedNote) return []
  const comments = store.openedNote.comments
    .filter((item) => !item.deleted)
    .sort((a, b) => a.createdAt - b.createdAt)

  return comments
    .filter((item) => !item.parentId)
    .map((item) => ({
      ...item,
      replies: comments.filter((reply) => reply.parentId === item.id)
    }))
})

function submitComment() {
  const text = commentDraft.value.trim()
  if (!text || !store.openedNote) return
  store.addComment(store.openedNote.id, text, replyTarget.value)
  commentDraft.value = ''
  replyTarget.value = null
}

function toggleLike() {
  if (store.openedNote) {
    store.toggleLike(store.openedNote.id)
  }
}

function toggleFavorite() {
  if (store.openedNote) {
    store.toggleFavorite(store.openedNote.id)
  }
}
</script>

<template>
  <div class="detail-mask" :class="{ show: !!store.openedNote }" @click.self="store.closeDetail()">
    <article v-if="store.openedNote" class="detail-modal">
      <div class="detail-media">
        <img v-if="store.openedNote.type === 'image'" :src="store.openedNote.cover" :alt="store.openedNote.title" />
        <video v-else controls :src="store.openedNote.media[0]"></video>
      </div>
      <div class="detail-content">
        <div class="detail-top">
          <div>
            <span class="topic-badge light">{{ store.openedNote.topicName }}</span>
            <h3>{{ store.openedNote.title }}</h3>
            <p class="detail-meta">{{ store.openedNote.author }} · {{ store.openedNote.displayTime }}</p>
          </div>
          <button type="button" class="close-plain" @click="store.closeDetail()">关闭</button>
        </div>

        <p class="detail-text">{{ store.openedNote.content }}</p>
        <p v-if="store.openedNote.subtitle" class="subtitle-line">字幕：{{ store.openedNote.subtitle }}</p>

        <div class="card-tags">
          <span v-for="tag in store.openedNote.tags" :key="tag">#{{ tag }}</span>
        </div>

        <div class="detail-stats">
          <button type="button" class="icon-btn" :class="{ active: store.openedNote.isLiked }" @click="toggleLike()">
            ♡ {{ store.openedNote.likes }}
          </button>
          <button type="button" class="icon-btn" :class="{ active: store.openedNote.isFavorited }" @click="toggleFavorite()">
            ☆ {{ store.openedNote.favorites }}
          </button>
          <span>💬 {{ store.openedNote.commentsCount }}</span>
          <span>👁 {{ store.openedNote.interactions.views }}</span>
        </div>

        <div class="comment-box detail-comment-box">
          <input
            v-model="commentDraft"
            :placeholder="replyTarget ? '回复这条评论...' : '写下你的评论，支持 emoji 😊'"
            @keyup.enter="submitComment()"
          />
          <button type="button" class="primary" @click="submitComment()">发送</button>
        </div>
        <p v-if="replyTarget" class="reply-tip">
          当前在回复一条评论
          <button type="button" class="link-btn" @click="replyTarget = null">取消</button>
        </p>

        <div class="comment-list">
          <article v-for="comment in groupedComments" :key="comment.id" class="comment-item">
            <div class="comment-main">
              <strong>{{ comment.author }}</strong>
              <span>{{ comment.content }}</span>
            </div>
            <div class="comment-actions">
              <button type="button" class="link-btn" @click="replyTarget = comment.id">回复</button>
              <button
                v-if="store.openedNote.authorId === store.userProfile.id || comment.authorId === store.userProfile.id"
                type="button"
                class="link-btn danger"
                @click="store.deleteComment(store.openedNote.id, comment.id)"
              >
                删除
              </button>
            </div>

            <div v-if="comment.replies.length" class="reply-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <strong>{{ reply.author }}</strong>
                <span>{{ reply.content }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </article>
  </div>
</template>
