<script setup>
const trends = [
  { keyword: 'codex cli好用吗', heat: 9021 },
  { keyword: 'codex安装', heat: 6380 },
  { keyword: 'codex白嫖', heat: 5122 },
  { keyword: 'codex手表', heat: 3223 }
]
</script>

<template>
  <aside class="right-sidebar">
    <section class="trend-card">
      <h3>大家都在搜</h3>
      <ul>
        <li v-for="item in trends" :key="item.keyword">
          <span>{{ item.keyword }}</span>
          <small>{{ item.heat }}</small>
        </li>
      </ul>
    </section>
  </aside>
</template>
