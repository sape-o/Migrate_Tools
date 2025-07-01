<template>
    <div class="full-card">
      <h2>รายการวัตถุทั้งหมด</h2>
      <ul>
        <li v-for="item in objects" :key="item.no">
          {{ item.no }} - {{ item.name }} - {{ item.location }}
        </li>
      </ul>
    </div>
</template>

<script setup>
import DefaultLayout from '../layouts/DefaultLayout.vue'

const objects = Array.from({ length: 20 }, (_, i) => ({
  no: i + 1,
  name: `Object ${i + 1}`,
  location: ['Bangkok', 'Chiandddddddddddddddddddddddg Mai', 'Phuket'][i % 3]
}))
</script>

<style scoped>
.full-card {
  height: calc(100vh - 40px); /* ลบ padding จาก layout ถ้ามี */
  width: 100%;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  padding: 24px;
  box-sizing: border-box;
  overflow-y: auto;
}
</style>