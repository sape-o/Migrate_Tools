import { createRouter, createWebHistory } from 'vue-router'
import ListObject from '../views/ListObject.vue'
import ListObjectGroup from '../views/ListObjectGroup.vue'
import ListPolicy from '../views/ListPolicy.vue'
import ImportObject from '../views/ImportObject.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/list-object', component: ListObject,},
    {path: '/list-object-group', component: ListObjectGroup,},
    {path: '/list-policy', component: ListPolicy,},
    {path: '/import-object', component: ImportObject,},

    {path: '/about',component: () => import('../views/AboutView.vue'),},

  ],
})

export default router
