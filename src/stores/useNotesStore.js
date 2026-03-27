import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { availableTags, campusTrends, defaultNotes, defaultTopics, defaultUserProfile } from '../data/mock'
import {
  addComment as apiAddComment,
  createNote as apiCreateNote,
  deleteComment as apiDeleteComment,
  fetchNotes,
  fetchProfile,
  fetchTopics,
  login as apiLogin,
  register as apiRegister,
  toggleFavorite as apiToggleFavorite,
  toggleLike as apiToggleLike,
  updateProfile as apiUpdateProfile
} from '../api/client'

const CONTENT_KEY = 'campus-redbook-content'
const USER_KEY = 'campus-redbook-user'
const API_ENABLED = Boolean(import.meta.env.VITE_API_BASE)

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function relativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const minute = 1000 * 60
  const hour = minute * 60
  const day = hour * 24

  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  return `${Math.floor(diff / day)} 天前`
}

function scoreNote(note, userProfile) {
  const now = Date.now()
  const visibleComments = note.comments.filter((item) => !item.deleted)
  const heatScore = note.likes * 2 + note.favorites * 3 + visibleComments.length * 4
  const freshness = Math.max(0, 1 - (now - note.createdAt) / (1000 * 60 * 60 * 24 * 7))
  const tagScore = note.tags.reduce((acc, tag) => acc + (userProfile.tags.includes(tag) ? 1 : 0), 0)
  const viewedPenalty = userProfile.history.includes(note.id) ? 0.88 : 1
  return (heatScore * 0.45 + freshness * 100 * 0.25 + tagScore * 30 * 0.3) * viewedPenalty
}

function normalizeNote(note) {
  if (!note) return note
  if (!note.interactions) {
    note.interactions = {
      views: note.views || 0,
      likedUsers: note.likedUsers || [],
      favoredUsers: note.favoredUsers || []
    }
  }
  if (!note.comments) {
    note.comments = []
  }
  return note
}

export const useNotesStore = defineStore('notes', () => {
  const persistedContent = safeParse(localStorage.getItem(CONTENT_KEY), null)
  const persistedUserState = safeParse(localStorage.getItem(USER_KEY), null)

  const notes = ref(clone(persistedContent?.notes || defaultNotes))
  const topics = ref(clone(persistedContent?.topics || defaultTopics))
  const userProfile = ref(clone(persistedUserState?.profile || defaultUserProfile))
  const authState = ref({
    isAuthenticated: persistedUserState?.auth?.isAuthenticated ?? false,
    username: persistedUserState?.auth?.username || userProfile.value.name,
    token: persistedUserState?.auth?.token || ''
  })

  const currentView = ref('discover')
  const feedMode = ref('recommend')
  const activeTag = ref('全部')
  const searchText = ref('')
  const selectedTopicId = ref((persistedContent?.topics || defaultTopics)[0]?.id || null)
  const topicSort = ref('hot')
  const openedNoteId = ref(null)

  const rankedNotes = computed(() =>
    [...notes.value]
      .map((note) => ({
        ...note,
        score: scoreNote(note, userProfile.value)
      }))
      .sort((a, b) => b.score - a.score)
  )

  const displayNotes = computed(() =>
    notes.value.map((note) => {
      const comments = note.comments.filter((item) => !item.deleted)
      const topic = topics.value.find((item) => item.id === note.topicId)
      return {
        ...note,
        cover: note.cover || note.media[0],
        topicName: topic?.name || '未加入话题',
        commentsCount: comments.length,
        displayTime: relativeTime(note.createdAt),
        isLiked: note.interactions.likedUsers.includes(userProfile.value.id),
        isFavorited: note.interactions.favoredUsers.includes(userProfile.value.id)
      }
    })
  )

  const feedNotes = computed(() => {
    let list =
      feedMode.value === 'recommend'
        ? rankedNotes.value
        : [...displayNotes.value].sort((a, b) =>
            feedMode.value === 'hot'
              ? b.likes + b.favorites + b.commentsCount * 2 - (a.likes + a.favorites + a.commentsCount * 2)
              : b.createdAt - a.createdAt
          )

    list = list.map((note) => displayNotes.value.find((item) => item.id === note.id) || note)

    if (activeTag.value !== '全部') {
      list = list.filter((note) => note.tags.includes(activeTag.value))
    }

    if (searchText.value.trim()) {
      const keyword = searchText.value.trim().toLowerCase()
      list = list.filter((note) =>
        `${note.title}${note.content}${note.tags.join('')}${note.author}${note.topicName}`.toLowerCase().includes(keyword)
      )
    }

    return list
  })

  const selectedTopic = computed(() => topics.value.find((topic) => topic.id === selectedTopicId.value) || null)

  const topicNotes = computed(() => {
    const source = displayNotes.value.filter((note) => note.topicId === selectedTopicId.value)
    return [...source].sort((a, b) =>
      topicSort.value === 'latest'
        ? b.createdAt - a.createdAt
        : b.likes + b.favorites + b.commentsCount * 2 - (a.likes + a.favorites + a.commentsCount * 2)
    )
  })

  const openedNote = computed(() => displayNotes.value.find((note) => note.id === openedNoteId.value) || null)

  const profileStats = computed(() => {
    const myNotes = displayNotes.value.filter((note) => note.authorId === userProfile.value.id)
    const likedNotes = displayNotes.value.filter((note) => note.isLiked)
    const favoritedNotes = displayNotes.value.filter((note) => note.isFavorited)

    return {
      myNotes,
      likedNotes,
      favoritedNotes,
      totalLikes: myNotes.reduce((acc, note) => acc + note.likes, 0)
    }
  })

  const favoriteCollections = computed(() =>
    userProfile.value.favoriteFolders.map((folder) => ({
      ...folder,
      notes: userProfile.value.favorites
        .filter((record) => record.folderId === folder.id)
        .map((record) => displayNotes.value.find((note) => note.id === record.noteId))
        .filter(Boolean)
    }))
  )

  const featuredTopics = computed(() => [...topics.value].sort((a, b) => b.heat - a.heat).slice(0, 3))

  function persist() {
    if (!API_ENABLED) {
      localStorage.setItem(
        CONTENT_KEY,
        JSON.stringify({
          notes: notes.value,
          topics: topics.value
        })
      )
    }
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        profile: userProfile.value,
        auth: authState.value
      })
    )
  }

  watch([notes, topics, userProfile, authState], persist, { deep: true })

  async function initialize() {
    if (!API_ENABLED) return
    const [apiNotes, apiTopics, apiProfile] = await Promise.all([fetchNotes(), fetchTopics(), fetchProfile()])
    notes.value = apiNotes.map((note) => normalizeNote(note))
    topics.value = apiTopics
    userProfile.value = apiProfile
  }

  function switchView(view) {
    currentView.value = view
  }

  function setFeedMode(mode) {
    feedMode.value = mode
  }

  function setActiveTag(tag) {
    activeTag.value = tag
  }

  function setSearchText(text) {
    searchText.value = text
  }

  function setSelectedTopic(topicId) {
    selectedTopicId.value = topicId
    currentView.value = 'topics'
  }

  function setTopicSort(sort) {
    topicSort.value = sort
  }

  function recordView(noteId) {
    const note = notes.value.find((item) => item.id === noteId)
    if (!note) return
    note.interactions.views += 1
    if (!userProfile.value.history.includes(noteId)) {
      userProfile.value.history.unshift(noteId)
      userProfile.value.history = userProfile.value.history.slice(0, 30)
    }
  }

  function openDetail(noteId) {
    openedNoteId.value = noteId
    recordView(noteId)
  }

  function closeDetail() {
    openedNoteId.value = null
  }

  async function publishNote(payload) {
    if (!authState.value.isAuthenticated) return false
    if (API_ENABLED) {
      const created = await apiCreateNote(payload)
      notes.value.unshift(normalizeNote(created))
      return true
    }

    const createdAt = Date.now()
    const nextNote = {
      id: createdAt,
      likes: 0,
      favorites: 0,
      comments: [],
      createdAt,
      interactions: { views: 0, likedUsers: [], favoredUsers: [] },
      author: userProfile.value.name,
      authorId: userProfile.value.id,
      cover: payload.cover || payload.media[0],
      ...payload
    }

    notes.value.unshift(nextNote)

    if (payload.topicId) {
      const target = topics.value.find((topic) => topic.id === Number(payload.topicId))
      if (target) {
        target.notes += 1
        target.participants += 1
      }
    }
    return true
  }

  async function toggleLike(noteId) {
    if (API_ENABLED) {
      const updated = await apiToggleLike(noteId)
      notes.value = notes.value.map((item) => (item.id === updated.id ? normalizeNote(updated) : item))
      return
    }
    const note = notes.value.find((item) => item.id === noteId)
    if (!note) return
    const hasLiked = note.interactions.likedUsers.includes(userProfile.value.id)
    if (hasLiked) {
      note.interactions.likedUsers = note.interactions.likedUsers.filter((id) => id !== userProfile.value.id)
      note.likes = Math.max(0, note.likes - 1)
      userProfile.value.likes = userProfile.value.likes.filter((id) => id !== noteId)
      return
    }

    note.interactions.likedUsers.push(userProfile.value.id)
    note.likes += 1
    if (!userProfile.value.likes.includes(noteId)) {
      userProfile.value.likes.push(noteId)
    }
  }

  async function toggleFavorite(noteId, folderId = 'default') {
    if (API_ENABLED) {
      const updated = await apiToggleFavorite(noteId)
      notes.value = notes.value.map((item) => (item.id === updated.id ? normalizeNote(updated) : item))
      return
    }
    const note = notes.value.find((item) => item.id === noteId)
    if (!note) return
    const hasFavored = note.interactions.favoredUsers.includes(userProfile.value.id)
    if (hasFavored) {
      note.interactions.favoredUsers = note.interactions.favoredUsers.filter((id) => id !== userProfile.value.id)
      note.favorites = Math.max(0, note.favorites - 1)
      userProfile.value.favorites = userProfile.value.favorites.filter((record) => record.noteId !== noteId)
      return
    }

    note.interactions.favoredUsers.push(userProfile.value.id)
    note.favorites += 1
    userProfile.value.favorites = userProfile.value.favorites.filter((record) => record.noteId !== noteId)
    userProfile.value.favorites.push({ noteId, folderId })
  }

  async function addComment(noteId, content, parentId = null) {
    if (API_ENABLED) {
      await apiAddComment(noteId, { content, parentId })
      const updated = await fetchNotes()
      notes.value = updated.map((note) => normalizeNote(note))
      return
    }
    const note = notes.value.find((item) => item.id === noteId)
    if (!note) return

    note.comments.push({
      id: Date.now(),
      author: userProfile.value.name,
      authorId: userProfile.value.id,
      content,
      deleted: false,
      parentId,
      createdAt: Date.now()
    })
  }

  async function deleteComment(noteId, commentId) {
    if (API_ENABLED) {
      await apiDeleteComment(commentId)
      const updated = await fetchNotes()
      notes.value = updated.map((note) => normalizeNote(note))
      return
    }
    const note = notes.value.find((item) => item.id === noteId)
    if (!note) return
    const target = note.comments.find((item) => item.id === commentId)
    if (target) {
      target.deleted = true
    }
  }

  function createFavoriteFolder(name) {
    const trimmed = name.trim()
    if (!trimmed) return false
    const exists = userProfile.value.favoriteFolders.some((item) => item.name === trimmed)
    if (exists) return false
    userProfile.value.favoriteFolders.push({ id: `folder-${Date.now()}`, name: trimmed })
    return true
  }

  async function login({ username, password }) {
    if (API_ENABLED) {
      const result = await apiLogin({ username, password })
      authState.value = {
        isAuthenticated: true,
        username: username.trim(),
        token: result.token || 'demo-token'
      }
      localStorage.setItem('campus-redbook-token', authState.value.token)
      userProfile.value = result.profile
      switchView('discover')
      return { success: true }
    }
    const trimmedName = username?.trim()
    if (!trimmedName) {
      return { success: false, message: '请输入姓名或昵称。' }
    }
    if (!password?.trim()) {
      return { success: false, message: '请输入密码以继续。' }
    }

    authState.value = {
      isAuthenticated: true,
      username: trimmedName,
      token: 'demo-token'
    }
    localStorage.setItem('campus-redbook-token', authState.value.token)
    userProfile.value.name = trimmedName
    switchView('discover')

    return { success: true }
  }

  async function register({ username, password }) {
    if (API_ENABLED) {
      const result = await apiRegister({ username, password })
      authState.value = {
        isAuthenticated: true,
        username: username.trim(),
        token: result.token || 'demo-token'
      }
      localStorage.setItem('campus-redbook-token', authState.value.token)
      userProfile.value = result.profile
      switchView('discover')
      return { success: true }
    }
    return login({ username, password })
  }

  function logout() {
    authState.value = {
      isAuthenticated: false,
      username: '',
      token: ''
    }
    localStorage.removeItem('campus-redbook-token')
  }

  async function updateProfile(updates) {
    if (API_ENABLED) {
      const updated = await apiUpdateProfile(updates)
      userProfile.value = updated
      return
    }
    userProfile.value = {
      ...userProfile.value,
      ...updates
    }
    if (updates.tags) {
      userProfile.value.tags = [...new Set(updates.tags)]
    }
  }

  return {
    availableTags,
    campusTrends,
    currentView,
    feedMode,
    activeTag,
    searchText,
    selectedTopicId,
    topicSort,
    notes,
    topics,
    userProfile,
    authState,
    displayNotes,
    feedNotes,
    selectedTopic,
    topicNotes,
    openedNote,
    profileStats,
    favoriteCollections,
    featuredTopics,
    switchView,
    setFeedMode,
    setActiveTag,
    setSearchText,
    setSelectedTopic,
    setTopicSort,
    openDetail,
    closeDetail,
    publishNote,
    toggleLike,
    toggleFavorite,
    addComment,
    deleteComment,
    createFavoriteFolder,
    login,
    register,
    logout,
    updateProfile,
    initialize,
    apiEnabled: API_ENABLED
  }
})
