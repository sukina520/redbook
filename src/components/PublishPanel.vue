<script setup>
import { computed, ref } from 'vue'
import { useNotesStore } from '../stores/useNotesStore'

const store = useNotesStore()

const form = ref({
  title: '',
  content: '',
  type: 'image',
  filter: 'none',
  subtitle: '',
  topicId: '',
  tags: []
})

const imageFiles = ref([])
const videoFile = ref(null)
const previewUrls = ref([])
const warning = ref('')

const filterStyle = computed(() => ({
  filter:
    form.value.filter === 'fresh'
      ? 'saturate(1.2) contrast(1.05)'
      : form.value.filter === 'retro'
        ? 'sepia(0.4) contrast(0.95)'
        : 'none'
}))

function handleImages(event) {
  warning.value = ''
  const files = Array.from(event.target.files || [])
  if (files.length > 3) {
    warning.value = '最多上传 3 张图片。'
    return
  }
  imageFiles.value = files
  previewUrls.value = files.map((file) => URL.createObjectURL(file))
}

function handleVideo(event) {
  warning.value = ''
  const file = event.target.files?.[0]
  if (!file) return
  videoFile.value = file
  previewUrls.value = [URL.createObjectURL(file)]
}

async function submitNote() {
  warning.value = ''
  if (!form.value.title.trim()) {
    warning.value = '请填写标题。'
    return
  }

  if (form.value.type === 'image' && imageFiles.value.length === 0) {
    warning.value = '请至少上传 1 张图片。'
    return
  }

  if (form.value.type === 'video' && !videoFile.value) {
    warning.value = '请上传视频文件。'
    return
  }

  const payload = {
    title: form.value.title,
    content: form.value.content,
    author: '我',
    type: form.value.type,
    media: [...previewUrls.value],
    subtitle: form.value.subtitle,
    tags: form.value.tags.length ? form.value.tags : ['学习'],
    topicId: form.value.topicId || null,
    filter: form.value.filter
  }

  store.publishNote(payload)
  form.value = { title: '', content: '', type: 'image', filter: 'none', subtitle: '', topicId: '', tags: [] }
  imageFiles.value = []
  videoFile.value = null
  previewUrls.value = []
}
</script>

<template>
  <section class="card">
    <h2>发布笔记</h2>
    <div class="grid cols-2">
      <label>
        标题
        <input v-model="form.title" placeholder="输入标题" />
      </label>
      <label>
        类型
        <select v-model="form.type">
          <option value="image">图文</option>
          <option value="video">短视频</option>
        </select>
      </label>
      <label class="full">
        内容
        <textarea v-model="form.content" rows="3" placeholder="分享你的校园生活" />
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
        话题
        <select v-model="form.topicId">
          <option value="">不参与话题</option>
          <option v-for="topic in store.topics" :key="topic.id" :value="topic.id">{{ topic.name }}</option>
        </select>
      </label>
      <label class="full">
        标签
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
        上传图片（最多3张）
        <input type="file" accept="image/*" multiple @change="handleImages" />
      </label>
      <label v-else class="full">
        上传视频（15秒内）
        <input type="file" accept="video/*" @change="handleVideo" />
      </label>
      <label v-if="form.type === 'video'" class="full">
        视频字幕
        <input v-model="form.subtitle" placeholder="给视频加一句字幕" />
      </label>
    </div>
    <p v-if="warning" class="warn">{{ warning }}</p>
    <div class="preview-row" v-if="previewUrls.length">
      <img v-if="form.type === 'image'" v-for="url in previewUrls" :key="url" :src="url" :style="filterStyle" alt="预览图" />
      <video v-else controls :src="previewUrls[0]" :style="filterStyle"></video>
    </div>
    <button class="primary" @click="submitNote">发布</button>
  </section>
</template>
