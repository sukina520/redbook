<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useNotesStore } from '../stores/useNotesStore'
import { uploadImage, uploadVideo } from '../api/client'

const store = useNotesStore()

const maxTitleLength = 30
const maxContentLength = 300
const maxSubtitleLength = 40

const form = ref({
  title: '',
  content: '',
  type: 'image',
  filter: 'none',
  subtitle: '',
  topicId: store.selectedTopicId || '',
  tags: []
})

const imageFiles = ref([])
const videoFile = ref(null)
const previewUrls = ref([])
const uploadedMedia = ref([])
const warning = ref('')
const uploading = ref(false)

const filterStyle = computed(() => ({
  filter:
    form.value.filter === 'fresh'
      ? 'saturate(1.18) contrast(1.05) brightness(1.02)'
      : form.value.filter === 'retro'
        ? 'sepia(0.45) contrast(0.92) brightness(0.98)'
        : 'none'
}))

function revokePreviews() {
  previewUrls.value.forEach((url) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
}

watch(
  () => form.value.type,
  (nextType) => {
    warning.value = ''
    revokePreviews()
    previewUrls.value = []
    uploadedMedia.value = []
    imageFiles.value = []
    videoFile.value = null
    form.value.subtitle = nextType === 'video' ? form.value.subtitle : ''
  }
)

onBeforeUnmount(() => {
  revokePreviews()
})

async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxWidth = 1280
        const ratio = Math.min(1, maxWidth / img.width)
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

async function handleImages(event) {
  warning.value = ''
  const files = Array.from(event.target.files || [])
  if (!files.length) return
  if (files.length > 3) {
    warning.value = '最多上传 3 张图片。'
    return
  }

  revokePreviews()
  imageFiles.value = files
  previewUrls.value = await Promise.all(files.map((file) => compressImage(file)))

  if (store.apiEnabled) {
    uploading.value = true
    uploadedMedia.value = []
    try {
      for (const file of files) {
        const result = await uploadImage(file)
        uploadedMedia.value.push(result.url)
      }
    } catch (err) {
      warning.value = err?.message || '图片上传失败，请稍后重试。'
    } finally {
      uploading.value = false
    }
  }
}

function handleVideo(event) {
  warning.value = ''
  const file = event.target.files?.[0]
  if (!file) return

  revokePreviews()
  videoFile.value = file
  previewUrls.value = [URL.createObjectURL(file)]
  uploadedMedia.value = []

  if (store.apiEnabled) {
    uploading.value = true
    uploadVideo(file)
      .then((result) => {
        uploadedMedia.value = [result.url]
      })
      .catch((err) => {
        warning.value = err?.message || '视频上传失败，请稍后重试。'
      })
      .finally(() => {
        uploading.value = false
      })
  }
}

function validateForm() {
  if (!form.value.title.trim()) return '请填写标题。'
  if (form.value.title.trim().length > maxTitleLength) return `标题最多 ${maxTitleLength} 个字。`
  if (!form.value.content.trim()) return '请填写正文内容。'
  if (form.value.content.trim().length > maxContentLength) return `正文最多 ${maxContentLength} 个字。`
  if (!form.value.tags.length) return '请至少选择 1 个兴趣标签。'
  if (form.value.type === 'image' && imageFiles.value.length === 0) return '请至少上传 1 张图片。'
  if (form.value.type === 'video' && !videoFile.value) return '请上传短视频文件。'
  if (form.value.type === 'video' && form.value.subtitle.trim().length > maxSubtitleLength) {
    return `视频字幕最多 ${maxSubtitleLength} 个字。`
  }
  if (store.apiEnabled && uploading.value) return '素材上传中，请稍候。'
  if (store.apiEnabled && uploadedMedia.value.length === 0) return '素材尚未上传完成。'
  return ''
}

function resetForm() {
  revokePreviews()
  form.value = {
    title: '',
    content: '',
    type: 'image',
    filter: 'none',
    subtitle: '',
    topicId: store.selectedTopicId || '',
    tags: []
  }
  imageFiles.value = []
  videoFile.value = null
  previewUrls.value = []
}

async function submitNote() {
  warning.value = validateForm()
  if (warning.value) return

  const payload = {
    title: form.value.title.trim(),
    content: form.value.content.trim(),
    type: form.value.type,
    media: store.apiEnabled ? [...uploadedMedia.value] : [...previewUrls.value],
    subtitle: form.value.type === 'video' ? form.value.subtitle.trim() : '',
    tags: [...form.value.tags],
    topicId: form.value.topicId ? Number(form.value.topicId) : null,
    filter: form.value.filter,
    cover: store.apiEnabled ? uploadedMedia.value[0] : previewUrls.value[0]
  }

  try {
    const ok = await store.publishNote(payload)
    if (!ok) {
      warning.value = '请先登录再发布内容。'
      return
    }
    resetForm()
    store.switchView('discover')
  } catch (err) {
    warning.value = err?.message || '发布失败，请稍后重试。'
  }
}
</script>

<template>
  <section class="publish-page">
    <header class="page-heading">
      <div>
        <small class="eyebrow">内容发布</small>
        <h1>发布一篇属于校园生活的笔记</h1>
        <p>支持图文和短视频，图片会自动压缩，切换素材类型时会自动清理旧预览。</p>
      </div>
    </header>

    <section class="publish-layout">
      <article class="publish-form card-panel">
        <div class="grid cols-2">
          <label>
            标题
            <input v-model="form.title" :maxlength="maxTitleLength" placeholder="比如：今天找到一个超安静自习角落" />
          </label>
          <label>
            类型
            <select v-model="form.type">
              <option value="image">图文</option>
              <option value="video">短视频</option>
            </select>
          </label>
          <label class="full">
            正文
            <textarea v-model="form.content" :maxlength="maxContentLength" rows="5" placeholder="分享你的校园发现、经验或瞬间" />
          </label>
          <label>
            滤镜
            <select v-model="form.filter">
              <option value="none">原图</option>
              <option value="fresh">清新</option>
              <option value="retro">复古</option>
            </select>
          </label>
          <label>
            参与话题
            <select v-model="form.topicId">
              <option value="">暂不参与</option>
              <option v-for="topic in store.topics" :key="topic.id" :value="topic.id">{{ topic.name }}</option>
            </select>
          </label>
          <label class="full">
            兴趣标签
            <div class="tags-wrap">
              <button
                v-for="tag in store.availableTags"
                :key="tag"
                type="button"
                :class="['chip', { active: form.tags.includes(tag) }]"
                @click="form.tags.includes(tag) ? (form.tags = form.tags.filter((item) => item !== tag)) : form.tags.push(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </label>
          <label v-if="form.type === 'image'" class="full">
            上传图片（最多 3 张）
            <input type="file" accept="image/*" multiple @change="handleImages" />
          </label>
          <label v-else class="full">
            上传视频（建议 15 秒内）
            <input type="file" accept="video/*" @change="handleVideo" />
          </label>
          <label v-if="form.type === 'video'" class="full">
            视频字幕
            <input v-model="form.subtitle" :maxlength="maxSubtitleLength" placeholder="给视频补一句字幕" />
          </label>
        </div>
        <p v-if="warning" class="warn">{{ warning }}</p>
        <div class="form-actions">
          <button type="button" class="ghost" @click="resetForm">重置</button>
          <button type="button" class="primary" @click="submitNote">发布笔记</button>
        </div>
      </article>

      <article class="preview-panel card-panel">
        <div class="section-title">
          <h3>实时预览</h3>
          <span>{{ form.type === 'image' ? '图文卡片' : '视频卡片' }}</span>
        </div>
        <div v-if="previewUrls.length" class="preview-row">
          <template v-if="form.type === 'image'">
            <img
              v-for="url in previewUrls"
              :key="url"
              :src="url"
              :style="filterStyle"
              alt="预览图"
            />
          </template>
          <video v-else controls :src="previewUrls[0]" :style="filterStyle"></video>
        </div>
        <div v-else class="empty-preview">
          上传素材后，这里会展示压缩后的预览效果。
        </div>
      </article>
    </section>
  </section>
</template>
