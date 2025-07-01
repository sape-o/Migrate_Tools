<template>
  <div class="sidebar">
    <div
      v-for="(group, index) in navGroups"
      :key="group.name"
      class="nav-group"
    >
      <div class="nav-group-title" @click="toggleGroup(index)">
        <i :class="group.icon"></i>
        <span>{{ group.name }}</span>
        <i class="fas fa-chevron-down chevron" :class="{ rotated: openGroups[index] }"></i>
      </div>

      <transition name="slide">
        <div v-show="openGroups[index]" class="nav-subitems">
          <router-link
            v-for="item in group.items"
            :key="item.name"
            :to="item.to"
            class="nav-item"
            active-class="active"
          >
            <i :class="item.icon"></i>
            <span>{{ item.name }}</span>
          </router-link>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const openGroups = ref({}) // เก็บสถานะเปิดของแต่ละกลุ่มแยกกัน

const navGroups = [
  {
    name: 'Migrate Tool',
    icon: 'fas fa-tools',
    items: [
      { name: "List Object", to: "/list-object", icon: "fas fa-database" },
      { name: "List Object Group", to: "/list-object-group", icon: "fas fa-layer-group" },
      { name: "Import Object", to: "/import-object", icon: "fas fa-file-import" },
      { name: "List Policy", to: "/list-policy", icon: "fas fa-shield-alt" },
    ]
  },
  {
    name: 'Other',
    icon: 'fas fa-cogs',
    items: [
      { name: "Settings", to: "/settings", icon: "fas fa-sliders-h" }
    ]
  }
]

function toggleGroup(index) {
  openGroups.value[index] = !openGroups.value[index]
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  overflow-y: auto;
  padding: 20px;
  background-color: #ffffff;
  margin-left: 1%;
  margin-top: 1%;
  margin-bottom: 2.5vh;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.nav-group {
  margin-bottom: 12px;
}

.nav-group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  font-weight: bold;
  cursor: pointer;
  background-color: #f9f9f9;
  border-radius: 6px;
  color: #333;
  transition: background 0.3s;
}

.nav-group-title:hover {
  background-color: #ececec;
}

.nav-subitems {
  margin-top: 6px;
  padding-left: 10px;
  overflow: hidden;
}

.nav-item {
  color: #555;
  text-decoration: none;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  margin-bottom: 6px;
  transition: background 0.3s;
}

.nav-item:hover {
  background-color: #f0f0f0;
}

.active {
  background-color: #e0e0e0;
}

.chevron {
  margin-left: auto;
  transition: transform 0.3s ease;
}
.rotated {
  transform: rotate(180deg);
}

/* 🎯 Slide Animation */
.slide-enter-active, .slide-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
