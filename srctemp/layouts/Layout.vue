<template>
  <div id="app" class="layout-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>My App</h2>
      </div>
      <ul class="sidebar-menu">
        <li @click="navigateTo('home')">Home</li>
        <li @click="navigateTo('about')">About</li>
        <li @click="navigateTo('settings')">Settings</li>
      </ul>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Topbar -->
      <div class="topbar">
        <div class="topbar-left">
          <button @click="toggleSidebar">☰</button>
        </div>
        <div class="topbar-right">
          <span>Notifications</span>
        </div>
      </div>

      <!-- Content -->
      <div class="content">
        <h1>Welcome to My App</h1>
        <p>Click on the menu items to navigate.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const sidebarVisible = ref(true);

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
}

const navigateTo = (page) => {
  console.log(`Navigating to ${page}`);
}
</script>

<style scoped>
.layout-container {
  display: flex;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  height: 100vh;
  position: fixed;
  transition: transform 0.3s ease-in-out;
  transform: translateX(0);
}

.sidebar-header {
  padding: 20px;
  background-color: #34495e;
  text-align: center;
}

.sidebar-menu {
  list-style-type: none;
  padding: 0;
}

.sidebar-menu li {
  padding: 15px;
  cursor: pointer;
  border-bottom: 1px solid #34495e;
}

.sidebar-menu li:hover {
  background-color: #16a085;
}

.main-content {
  margin-left: 250px; /* Move content to the right to make space for sidebar */
  flex-grow: 1;
}

.topbar {
  display: flex;
  justify-content: space-between;
  background-color: #007ad9;
  color: white;
  padding: 10px 20px;
}

.topbar-left {
  display: flex;
  align-items: center;
}

.topbar-right {
  display: flex;
  align-items: center;
}

.topbar button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.content {
  padding: 20px;
  flex-grow: 1;
}
</style>
