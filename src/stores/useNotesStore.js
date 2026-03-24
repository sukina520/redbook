import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { availableTags, defaultNotes, defaultTopics } from '../data/mock'

const USER_ID = 'demo-user'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref([...defaultNotes])
  const activeTab = ref('recommend')
  const activeTag = ref('全部')
  const topics = ref([...defaultTopics])
  const userProfile = ref({
    tags: ['学习', '运动'],
    history: [101, 102],
    likes: []
  })

  const rankedNotes = computed(() => {
    const now = Date.now()
    return [...notes.value]
      .map((note) => {
        const hotScore = note.likes * 2 + note.favorites * 3 + note.comments.filter((c) => !c.deleted).length * 4
        const freshness = Math.max(0, 1 - (now - note.createdAt) / (1000 * 60 * 60 * 24 * 7))
        const tagScore = note.tags.reduce((acc, tag) => acc + (userProfile.value.tags.includes(tag) ? 1 : 0), 0)
        const historyScore = userProfile.value.history.includes(note.id) ? 0.4 : 1
        return {
          ...note,
          score: hotScore * 0.35 + tagScore * 30 * 0.3 + freshness * 100 * 0.2 + historyScore * 20 * 0.15
        }
      })
      .sort((a, b) => b.score - a.score)
  })

  const feedNotes = computed(() => {
    let list = [...rankedNotes.value]
    if (activeTab.value === 'hot') {
      list.sort((a, b) => b.likes + b.favorites - (a.likes + a.favorites))
    }
    if (activeTag.value !== '全部') {
      list = list.filter((n) => n.tags.includes(activeTag.value))
    }
    return list
  })

  function publishNote(payload) {
    notes.value.unshift({
      id: Date.now(),
      likes: 0,
      favorites: 0,
      comments: [],
      createdAt: Date.now(),
      interactions: { views: 0, likedUsers: [], favoredUsers: [] },
      ...payload
    })

    if (payload.topicId) {
      const targetTopic = topics.value.find((topic) => topic.id === Number(payload.topicId))
      if (targetTopic) {
        targetTopic.notes += 1
        targetTopic.participants += 1
      }
    }
  }

  function toggleLike(noteId) {
    const note = notes.value.find((item) => item.id === noteId)
    if (!note) return
    const hasLiked = note.interactions.likedUsers.includes(USER_ID)
    if (hasLiked) {
      note.interactions.likedUsers = note.interactions.likedUsers.filter((id) => id !== USER_ID)
      note.likes = Math.max(0, note.likes - 1)
    } else {
      note.interactions.likedUsers.push(USER_ID)
      note.likes += 1
      userProfile.value.likes.push(noteId)
    }
  }

  function toggleFavorite(noteId) {
    const note = notes.value.find((item) => item.id === noteId)
    if (!note) return
    const hasFavored = note.interactions.favoredUsers.includes(USER_ID)
    if (hasFavored) {
      note.interactions.favoredUsers = note.interactions.favoredUsers.filter((id) => id !== USER_ID)
      note.favorites = Math.max(0, note.favorites - 1)
    } else {
      note.interactions.favoredUsers.push(USER_ID)
      note.favorites += 1
    }
  }

  function addComment(noteId, content) {
    const note = notes.value.find((item) => item.id === noteId)
    if (!note) return
    note.comments.push({ id: Date.now(), author: '我', content, deleted: false })
  }

  function deleteComment(noteId, commentId) {
    const note = notes.value.find((item) => item.id === noteId)
    if (!note) return
    const targetComment = note.comments.find((comment) => comment.id === commentId)
    if (targetComment) targetComment.deleted = true
  }

  return {
    notes,
    topics,
    activeTab,
    activeTag,
    availableTags,
    feedNotes,
    publishNote,
    toggleLike,
    toggleFavorite,
    addComment,
    deleteComment
  }
})
