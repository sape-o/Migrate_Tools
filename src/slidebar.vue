<template>
  <div class="sidebar">
    <router-link
      v-for="item in navItems"
      :key="item.name"
      :to="item.to"
      class="nav-item"
      active-class="active"
    >
      <i :class="item.icon"></i>
      <span>{{ item.name }}</span>
    </router-link>
  </div>
</template>

<script setup>
const navItems = [
  { name: "List Object", to: "/list-object", icon: "fas fa-home" },
  { name: "List Object Group", to: "/list-object-group", icon: "fas fa-user" },
];
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  background-color: #2c3e50;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
}

.nav-item {
  color: #ecf0f1;
  text-decoration: none;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  transition: background 0.3s;
}

.nav-item i {
  margin-right: 10px;
}

.nav-item:hover {
  background-color: #34495e;
}

.active {
  background-color: #1abc9c;
}
</style>
