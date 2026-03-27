const API_BASE = import.meta.env.VITE_API_BASE || ''

function getToken() {
  return localStorage.getItem('campus-redbook-token') || ''
}

function buildUrl(path) {
  if (!API_BASE) return path
  return `${API_BASE.replace(/\/$/, '')}${path}`
}

async function request(path, options = {}) {
  const token = getToken()
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Request failed')
  }

  if (response.status === 204) {
    return null
  }
  return response.json()
}

async function uploadFile(path, file) {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Upload failed')
  }
  return response.json()
}

export async function login(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function register(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function uploadImage(file) {
  return uploadFile('/api/uploads/image', file)
}

export async function uploadVideo(file) {
  return uploadFile('/api/uploads/video', file)
}

export async function fetchNotes() {
  return request('/api/notes')
}

export async function fetchTopics() {
  return request('/api/topics')
}

export async function fetchProfile() {
  return request('/api/profile')
}

export async function updateProfile(payload) {
  return request('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
}

export async function createNote(payload) {
  return request('/api/notes', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function toggleLike(noteId) {
  return request(`/api/notes/${noteId}/like`, { method: 'POST' })
}

export async function toggleFavorite(noteId) {
  return request(`/api/notes/${noteId}/favorite`, { method: 'POST' })
}

export async function addComment(noteId, payload) {
  return request(`/api/notes/${noteId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function deleteComment(commentId) {
  return request(`/api/notes/comments/${commentId}`, { method: 'DELETE' })
}
