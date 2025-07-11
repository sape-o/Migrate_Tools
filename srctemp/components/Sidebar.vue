<template>
  <div class="sidebar">
    <div class="nav-section">
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
            <div v-for="sub in group.items" :key="sub.name">

              <!-- เมนูมี submenu ซ้อน -->
              <div v-if="sub.items">
                <button
                  class="nav-item toggle-subgroup"
                  @click="toggleSubGroup(sub.name)"
                  type="button"
                >
                  <i :class="sub.icon"></i>
                  <span>{{ sub.name }}</span>
                  <i
                    class="fas fa-chevron-down chevron"
                    :class="{ rotated: openSubGroups[sub.name] }"
                    style="margin-left: auto;"
                  ></i>
                </button>

                <transition name="slide">
                  <div v-show="openSubGroups[sub.name]" style="padding-left: 12px;">
                    <router-link
                      v-for="item in sub.items"
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

              <!-- เมนูปกติ -->
              <router-link
                v-else
                :to="sub.to"
                class="nav-item"
                active-class="active"
              >
                <i :class="sub.icon"></i>
                <span>{{ sub.name }}</span>
              </router-link>

            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- ปุ่ม Logout -->
    <div class="logout-section">
      <button class="logout-btn" @click="handleLogout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const openGroups = ref({})
const openSubGroups = ref({})

// ✅ path แยกกันแล้ว
const navGroups = [
  {
    name: 'Migrate Tool',
    icon: 'fas fa-tools',
    items: [
      {
        name: 'Object',
        icon: 'fas fa-box',
        items: [
          { name: "Import Service", to: "/import-service", icon: "fas fa-layer-group" },
          { name: "Import Service Group", to: "/import-service-group", icon: "fas fa-file-import" },
          { name: "Import Address", to: "/import-address", icon: "fas fa-shield-alt" },
          { name: "Import Address Group", to: "/import-address-group", icon: "fas fa-shield-alt" },
        ]
      },
      { name: "Import Policy", to: "/import-policy", icon: "fas fa-shield-alt" }
    ]
  },
  {
    name: 'Change',
    icon: 'fas fa-exchange-alt',
    items: [
      {
        name: 'Security Team',
        icon: 'fas fa-file-alt',
        items: [
          { name: "Request Change", to: "/change-firewall-document", icon: "fas fa-file-code" }
        ]
      },
      {
        name: 'Device',
        icon: 'fas fa-microchip',
        items: [
          { name: "Change Security Team", to: "/change-security-team", icon: "fas fa-fire" }
        ]
      },
      { name: "Admin Change Request", to: "/admin-change-request", icon: "fas fa-fire" }
      
    ]
  },
  {
    name: 'Admin',
    icon: 'fas fa-exchange-alt',
    items: [
      { name: "Device Asset", to: "/device-asset", icon: "fas fa-fire" },
      { name: "purchase", to: "/purchese", icon: "fas fa-fire" }
    ]
  },
  {
    name: 'Root',
    icon: 'fas fa-cogs',
    items: [
      { name: "File Migrate Tools", to: "/file-db", icon: "fas fa-database" },
      { name: "User", to: "/user", icon: "fas fa-database" }
    ]
  }
]

function toggleGroup(index) {
  openGroups.value[index] = !openGroups.value[index]
}

function toggleSubGroup(key) {
  openSubGroups.value[key] = !openSubGroups.value[key]
}

function handleLogout() {
  localStorage.removeItem('token')
  router.push('/login')
  // TODO: replace with router.push('/login') หรือลบ token
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  width: 240px;
  background-color: #ffffff;
  padding: 20px;
  box-sizing: border-box;
  margin: 1% 0 2.5vh 1%;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.nav-section {
  overflow-y: auto;
  flex-grow: 1;
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

/* Slide transition */
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

/* Logout */
.logout-section {
  padding-top: 10px;
  border-top: 1px solid #ddd;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  width: 100%;
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.logout-btn i {
  margin-right: 8px;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.nav-item.toggle-subgroup {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  color: #555;
  display: flex;
  align-items: center;
  border-radius: 4px;
  cursor: pointer;
  font: inherit;
}

.nav-item.toggle-subgroup:hover {
  background-color: #f0f0f0;
}
</style>
