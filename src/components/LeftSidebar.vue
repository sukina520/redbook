<script setup>
const navItems = [
  { key: 'discover', icon: '⌂', label: '发现', active: true },
  { key: 'live', icon: '◉', label: '直播' },
  { key: 'publish', icon: '+', label: '发布' },
  { key: 'notify', icon: '◌', label: '通知' },
  { key: 'me', icon: '◍', label: '我' }
]
</script>

<template>
  <aside class="left-sidebar">
    <div class="brand">小红书</div>
    <nav class="left-nav">
      <button v-for="item in navItems" :key="item.key" class="nav-item" :class="{ active: item.active }" type="button">
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </button>
    </nav>
    <button class="more-btn" type="button">☰ 更多</button>
  </aside>
</template>
