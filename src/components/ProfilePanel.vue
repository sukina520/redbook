<script setup>
import { ref, watch } from 'vue'
import { useNotesStore } from '../stores/useNotesStore'

const store = useNotesStore()
const folderName = ref('')
const editForm = ref({
  name: store.userProfile.name,
  bio: store.userProfile.bio,
  avatar: store.userProfile.avatar,
  tags: [...store.userProfile.tags]
})

watch(
  () => store.userProfile,
  (profile) => {
    editForm.value = {
      name: profile.name,
      bio: profile.bio,
      avatar: profile.avatar,
      tags: [...profile.tags]
    }
  },
  { deep: true, immediate: true }
)

function createFolder() {
  if (store.createFavoriteFolder(folderName.value)) {
    folderName.value = ''
  }
}

function toggleTag(tag) {
  if (editForm.value.tags.includes(tag)) {
    editForm.value.tags = editForm.value.tags.filter((item) => item !== tag)
  } else {
    editForm.value.tags = [...editForm.value.tags, tag]
  }
}

async function saveProfile() {
  await store.updateProfile({
    name: editForm.value.name.trim(),
    bio: editForm.value.bio.trim(),
    avatar: editForm.value.avatar.trim(),
    tags: editForm.value.tags
  })
}

function logout() {
  store.logout()
}
</script>

<template>
  <section class="profile-page">
    <header class="profile-header card-panel">
      <img :src="store.userProfile.avatar" :alt="store.userProfile.name" />
      <div class="profile-copy">
        <small class="eyebrow">个人主页</small>
        <h1>{{ store.userProfile.name }}</h1>
        <p>{{ store.userProfile.bio }}</p>
        <div class="profile-tags">
          <span v-for="tag in store.userProfile.tags" :key="tag">#{{ tag }}</span>
        </div>
      </div>
      <div class="profile-stats">
        <div>
          <strong>{{ store.profileStats.myNotes.length }}</strong>
          <span>我的笔记</span>
        </div>
        <div>
          <strong>{{ store.profileStats.totalLikes }}</strong>
          <span>累计获赞</span>
        </div>
        <div>
          <strong>{{ store.profileStats.favoritedNotes.length }}</strong>
          <span>我的收藏</span>
        </div>
      </div>
    </header>

    <section class="card-panel profile-edit-panel">
      <div class="section-title">
        <h3>编辑个人信息</h3>
        <span>当前账号：{{ store.authState.username }}</span>
      </div>
      <div class="grid cols-2">
        <label>
          昵称
          <input v-model="editForm.name" type="text" />
        </label>
        <label>
          头像
          <input v-model="editForm.avatar" type="text" placeholder="填写图片链接" />
        </label>
        <label class="full">
          个性签名
          <textarea v-model="editForm.bio" rows="3"></textarea>
        </label>
        <label class="full">
          兴趣标签
          <div class="tags-wrap">
            <button
              v-for="tag in store.availableTags"
              :key="tag"
              type="button"
              :class="['chip', { active: editForm.tags.includes(tag) }]"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </label>
      </div>
      <div class="form-actions">
        <button type="button" class="ghost" @click="logout">注销</button>
        <button type="button" class="primary" @click="saveProfile">保存修改</button>
      </div>
    </section>

    <section class="profile-sections">
      <article class="card-panel">
        <div class="section-title">
          <h3>我发布的</h3>
          <span>{{ store.profileStats.myNotes.length }} 篇</span>
        </div>
        <div class="simple-list">
          <button v-for="note in store.profileStats.myNotes" :key="note.id" type="button" class="simple-item" @click="store.openDetail(note.id)">
            <strong>{{ note.title }}</strong>
            <span>{{ note.displayTime }}</span>
          </button>
          <p v-if="!store.profileStats.myNotes.length" class="empty-copy">你还没有发布内容，先去发第一篇吧。</p>
        </div>
      </article>

      <article class="card-panel">
        <div class="section-title">
          <h3>我的收藏夹</h3>
          <span>{{ store.favoriteCollections.length }} 个</span>
        </div>
        <div class="folder-create">
          <input v-model="folderName" type="text" placeholder="新建收藏夹名称" />
          <button type="button" class="ghost" @click="createFolder">新建</button>
        </div>
        <div class="collection-list">
          <section v-for="folder in store.favoriteCollections" :key="folder.id" class="collection-card">
            <strong>{{ folder.name }}</strong>
            <p>{{ folder.notes.length }} 篇内容</p>
            <button
              v-for="note in folder.notes.slice(0, 3)"
              :key="note.id"
              type="button"
              class="mini-note"
              @click="store.openDetail(note.id)"
            >
              {{ note.title }}
            </button>
          </section>
        </div>
      </article>
    </section>
  </section>
</template>
