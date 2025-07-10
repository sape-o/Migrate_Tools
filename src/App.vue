<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

// Layouts
import DefaultLayout from './layouts/DefaultLayout.vue'
import LoginLayout from './layouts/LoginLayout.vue'
import Layout from './layouts/Layout.vue'
const route = useRoute()

// เลือก layout จาก meta.layout
const layoutComponent = computed(() => {
  return route.meta.layout === 'auth' ? LoginLayout : Layout
})
</script>

<template>
  <!--
    ใส่ key เพื่อบังคับรีเรนเดอร์ component layout
    เวลาที่ route เปลี่ยนแปลง จะโหลด layout ใหม่
  -->
  <component :is="layoutComponent" :key="route.path">
    <router-view />
  </component>
</template>

<style>
body, html, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}
* {
  box-sizing: inherit;
}
</style>
