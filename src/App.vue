<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Sidebar from './components/Sidebar.vue';
</script>


<template>
  <div class="app-container">
    <Sidebar />
    <router-view />
  </div>
</template>

<style>
.app-container {
  display: flex;
}
</style>



