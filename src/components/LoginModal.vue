<script setup>
import { ref } from 'vue'
import { useNotesStore } from '../stores/useNotesStore'

const store = useNotesStore()
const form = ref({ username: '', password: '' })
const error = ref('')
const loading = ref(false)
const mode = ref('login')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const result =
      mode.value === 'login'
        ? await store.login(form.value)
        : await store.register(form.value)
    if (!result.success) {
      error.value = result.message
    }
  } catch (err) {
    error.value = err?.message || '登录失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-mask">
    <section class="auth-modal">
      <header>
        <strong>欢迎回到校园红书</strong>
        <p>用昵称+密码登录，随后就可以发布笔记和管理个人信息。</p>
      </header>

      <label>
        用户名
        <input v-model="form.username" type="text" placeholder="例如：xiaolin" />
      </label>

      <label>
        密码
        <input v-model="form.password" type="password" placeholder="示例密码：demo123" />
      </label>

      <p v-if="error" class="auth-error">{{ error }}</p>

      <button type="button" class="primary" :disabled="loading" @click="submit">
        {{ loading ? '处理中...' : mode === 'login' ? '登录并进入' : '注册并进入' }}
      </button>
      <button type="button" class="link-btn" @click="mode = mode === 'login' ? 'register' : 'login'">
        {{ mode === 'login' ? '没有账号？去注册' : '已有账号？去登录' }}
      </button>
      <small>账号密码用于登录，昵称可在个人主页修改。</small>
    </section>
  </div>
</template>
