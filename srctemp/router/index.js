import { createRouter, createWebHistory } from 'vue-router'

import ListService from '../views/Migrate/Object/ListService.vue'
import ListServiceGroup from '../views/Migrate/Object/ListServiceGroup.vue'
import ListAddress from '../views/Migrate/Object/ListAddress.vue'
import ListAddressGroup from '../views/Migrate/Object/ListAddressGroup.vue'
import ListPolicy from '../views/Migrate/ListPolicy.vue'

import ImportService from '../views/Migrate/Object/ImportService.vue'
import ImportServiceGroup from '../views/Migrate/Object/ImportServiceGroup.vue'
import ImportAddress from '../views/Migrate/Object/ImportAddress.vue'
import ImportAddressGroup from '../views/Migrate/Object/ImportAddressGroup.vue'
import ImportPolicy from '../views/Migrate/ImportPolicy.vue'

import FileDB from '../views/Admin/FileDB.vue'
import ChangeSecurityTeam from '../views/Change/ChangeSecurityTeam.vue'
import CompareSecurityTeam from '../views/Change/CompareChangeSecurityTeam.vue'
import AdminChange from '@/views/Change/AdminChange.vue'
import DeviceAsset from '@/views/Asset/DeviceAsset.vue'
import User from '../views/Admin/User.vue'
import Login from '../views/login.vue'
import Dashboard from '@/views/Dashboard.vue'

const routes = [
  {
    path: '/',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    component: Login,
    meta: { layout: 'auth' },
  },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/list-service/:id', component: ListService, meta: { requiresAuth: true } },
  { path: '/list-service-group', component: ListServiceGroup, meta: { requiresAuth: true } },
  { path: '/list-address/:id', component: ListAddress, meta: { requiresAuth: true } },
  { path: '/list-address-group', component: ListAddressGroup, meta: { requiresAuth: true } },
  { path: '/list-policy', component: ListPolicy, meta: { requiresAuth: true } },
  { path: '/import-service', component: ImportService, meta: { requiresAuth: true } },
  { path: '/import-service-group', component: ImportServiceGroup, meta: { requiresAuth: true } },
  { path: '/import-address', component: ImportAddress, meta: { requiresAuth: true } },
  { path: '/import-address-group', component: ImportAddressGroup, meta: { requiresAuth: true } },
  { path: '/import-policy', component: ImportPolicy, meta: { requiresAuth: true } },
  { path: '/file-db', component: FileDB, meta: { requiresAuth: true } },
  { path: '/change-security-team', component: ChangeSecurityTeam, meta: { requiresAuth: true } },
  { path: '/compare-change-security-team/:id', component: CompareSecurityTeam, meta: { requiresAuth: true } },
  { path: '/admin-change-request', component: AdminChange, meta: { requiresAuth: true } },
  { path: '/device-asset', component: DeviceAsset, meta: { requiresAuth: true } },
  { path: '/user', component: User, meta: { requiresAuth: true } },

  // catch-all route: ถ้า path ไม่เจอ ให้ redirect ไป /login (หรือจะเปลี่ยนเป็น 404 page ก็ได้)
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
    meta: { layout: 'auth' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    // ถ้าหน้านี้ต้อง login แต่ไม่มี token ให้ไป login
    return next('/login')
  }
  if (to.path === '/login' && token) {
    // ถ้าอยู่หน้า login แล้วมี token ให้ไป dashboard เลย
    return next('/dashboard')
  }
  next()
})

export default router
