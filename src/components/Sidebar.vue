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
  { name: "Import Object", to: "/import-object", icon: "fas fa-home" },
  { name: "List Policy", to: "/list-policy", icon: "fas fa-user" },
];
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  max-height: 100vh;   /* สูงไม่เกิน viewport */
  overflow-y: auto;    /* เพิ่ม scroll ถ้าเนื้อหายาวเกิน */
  padding: 20px;
  background-color: #ffffff;
  color: white;
  margin-left: 1%;
  margin-top: 1%;
  margin-bottom: 2.5vh;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
}

.nav-item {
  color: #555;
  text-decoration: none;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  margin-bottom: 8px;
  transition: background 0.3s;
}

.nav-item:hover {
  background-color: #f0f0f0;
}

.active {
  background-color: #e0e0e0;
}
</style>
