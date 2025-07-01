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
  position: fixed; /* ติดกับขอบซ้ายตลอด */
  top: 20px;
  left: 10px;
  height: calc(100vh - 40px); /* เว้นขอบบน-ล่างรวม 40px */  width: 220px;
  background-color: #2c3e50;
  padding: 15px 10px; /* margin ด้านในเล็กน้อย */
  border-radius: 12px;   /* มนทั้งกล่อง */
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
    margin-left: 10px;     /* เลื่อนออกจากขอบจอเล็กน้อย */
}

.nav-item {
  color: #ecf0f1;
  text-decoration: none;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background 0.3s;
}

.nav-item i {
  margin-right: 10px;
}

.nav-item:hover {
  background-color: #f4ffb6;
}

.active {
  background-color: #1abc9c;
}
</style>
