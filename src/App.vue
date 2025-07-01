<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Sidebar from './components/Sidebar.vue';
import DefaultLayout from './layouts/DefaultLayout.vue'
</script>


<template>
    <DefaultLayout>
      <router-view />
    </DefaultLayout>
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



