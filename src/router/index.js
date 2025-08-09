import AppLayout from '@/layout/AppLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/tools/delete-metadata',
                    name: 'DeleteMetadata',
                    component: () => import('@/views/tools/DeleteMetaData.vue')
                },
                {
                    path: '/migration/migration-address',
                    name: 'migrationaddress',
                    component: () => import('@/views/migration/MigrationAddress.vue')
                },
                {
                    path: '/migration/migration-address-detail/:id',
                    name: 'migrationAddressDetail',
                    component: () => import('@/views/migration/MigrationAddressDetail.vue')
                },
                {
                    path: '/migration/migration-address-group',
                    name: 'migrationAddressGroup',
                    component: () => import('@/views/migration/MigrationAddressGroup.vue')
                },
                {
                    path: '/migration/migration-address-group-detail/:id',
                    name: 'migrationAddressGroupDetail',
                    component: () => import('@/views/migration/MigrationAddressGroupDetail.vue')
                },
                {
                    path: '/migration/migration-service',
                    name: 'migrationService',
                    component: () => import('@/views/migration/MigrationService.vue')
                },
                {
                    path: '/migration/migration-service-detail/:id',
                    name: 'migrationServiceDetail',
                    component: () => import('@/views/migration/MigrationServiceDetail.vue')
                },
                {
                    path: '/migration/migration-service-group',
                    name: 'migrationServiceGroup',
                    component: () => import('@/views/migration/MigrationServiceGroup.vue')
                },
                {
                    path: '/migration/migration-service-group-detail/:id',
                    name: 'migrationServiceGroupDetail',
                    component: () => import('@/views/migration/MigrationServiceGroupDetail.vue')
                },
                {
                    path: '/migration/migration-policy',
                    name: 'migrationPolicy',
                    component: () => import('@/views/migration/MigrationPolicy.vue')
                },
                {
                    path: '/migration/migration-policy-detail/:id',
                    name: 'migrationPolicyDetail',
                    component: () => import('@/views/migration/MigrationPolicyDetail.vue')
                },
                {
                    path: '/migration/migration-policy-map',
                    name: 'migrationPolicyMap',
                    component: () => import('@/views/migration/MigrationPolicyMap.vue')
                },
                {
                    path: '/migration/migration-policy-map-use/:id',
                    name: 'migrationPolicyMapUse',
                    component: () => import('@/views/migration/MigrationPolicyMapUse.vue')
                },
                {
                    path: '/migration/migration-checkpoint-api-get/',
                    name: 'migrationCheckpointApiGet',
                    component: () => import('@/views/migration/api/MigrationCheckpointApiGet.vue')
                },
                {
                    path: '/root/users',
                    component: AppLayout,
                    component: () => import('@/views/root/RootUser.vue')
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/InputDoc.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/Documentation.vue')
                }
            ]
        },

        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});
/*
router.beforeEach((to, from, next) => {
  const publicPages = ['/auth/login', '/landing', '/auth/error', '/auth/access'];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem('token');

  if (authRequired && !token) {
    return next('/auth/login');
  }

  next();
});
*/
export default router
