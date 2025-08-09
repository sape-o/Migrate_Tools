<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: '-DEV-Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'TOOLS',
        items: [
            { label: 'DEL META DATA', icon: 'pi pi-fw pi-id-card', to: '/tools/delete-metadata' },
        ]
    },
    {
        label: 'ENGINEER',
        icon: 'pi pi-fw pi-sign-in',
        to: '/pages',
        items: [
            {
                label: 'MIGRATION',
                icon: 'pi pi-fw pi-sign-in',
                items: [
                    {
                        label: 'API CHECK POINT',
                        icon: 'pi pi-fw pi-sign-in',
                        to: '/migration/migration-checkpoint-api-get'
                    },
                    {
                        label: 'MIGRATION PALO',
                        icon: 'pi pi-fw pi-sign-in',
                        items: [
                            { 
                                label: 'ADDRESS',
                                icon: 'pi pi-fw pi-sign-in',
                                to: '/migration/migration-address'
                            },
                            {
                                label: 'ADDRESS GROUP',
                                icon: 'pi pi-fw pi-sign-in',
                                to: '/migration/migration-address-group',
                            },
                            {
                                label: 'SERVICE',
                                icon: 'pi pi-fw pi-sign-in',
                                to: '/migration/migration-service'
                            },
                            {
                                label: 'SERVICE GROUP',
                                icon: 'pi pi-fw pi-sign-in',
                                to: '/migration/migration-service-group'
                            },
                            {
                                label: 'POLICY',
                                icon: 'pi pi-fw pi-sign-in',
                                to: '/migration/migration-policy'
                            },
                            {
                                label: 'POLICY MAP',
                                icon: 'pi pi-fw pi-sign-in',
                                to: '/migration/migration-policy-map'
                            },
                        ]
                    },
                    {
                        label: '-DEV-MIGRATION CHECK POINT',
                        icon: 'pi pi-fw pi-sign-in',
                        items: [
                            { 
                                label: '-DEV-ADDRESS',
                                icon: 'pi pi-fw pi-sign-in',
                                to: '/migration/migration-address'
                            },
                            {
                                label: '-DEV-ADDRESS GROUP',
                                icon: 'pi pi-fw pi-sign-in',
                                to: '/migration/migration-address-group',
                            },
                            {
                                label: '-DEV-SERVICE',
                                icon: 'pi pi-fw pi-sign-in',
                                to: '/migration/migration-service'
                            },
                            {
                                label: '-DEV-SERVICE GROUP',
                                icon: 'pi pi-fw pi-sign-in',
                                to: '/migration/migration-service-group'
                            },
                            {
                                label: '-DEV-POLICY',
                                icon: 'pi pi-fw pi-sign-in',
                                to: '/migration/migration-policy'
                            },
                            {
                                label: '-DEV-POLICY MAP',
                                icon: 'pi pi-fw pi-sign-in',
                                to: '/migration/migration-policy-map'
                            },
                        ]
                    },
                ]
            },
            
        ]
    },
    {
        label: 'CHANGE',
        items: [
            { label: '-DEV-CHANGE REQUEST', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
            { label: '-DEV-CHANGE APPROVE', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
        ]
    },
        {
        label: 'ADMIN OFFICER',
        items: [
            { label: '-DEV-CHANGE REQUEST', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
            { label: '-DEV-CHANGE APPROVE', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
        ]
    },
    {
        label: 'ROOT ZONE',
        items: [
            {
                label: 'USER SETTINGS',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'USER',
                        icon: 'pi pi-fw pi-sign-in',
                        to: '/root/users'
                    },
                    {
                        label: '-DEV-USER ENTITY',
                        icon: 'pi pi-fw pi-times-circle',
                        to: '/auth/error'
                    },
                ]
            },
            {
                label: 'MIGRATE',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                    {
                        label: 'MIGRATE 1.1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            { label: '-DEV-MIGRATE 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                            { label: '-DEV-MIGRATE 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                            { label: '-DEV-MIGRATE 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                        ]
                    },
                    {
                        label: '-DEV-MIGRATE 1.2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [{ label: '-DEV-MIGRATE 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                    }
                ]
            },
            {
                label: '-DEV-CHANGE',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                    {
                        label: '-DEV-CHANGE 2.1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            { label: '-DEV-CHANGE 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                            { label: '-DEV-CHANGE 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                        ]
                    },
                    {
                        label: '-DEV-CHANGE 2.2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [{ label: '-DEV-CHANGE 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
                    }
                ]
            }
        ]
    },
    {
        label: 'Get Started',
        items: [
            {
                label: 'Documentation',
                icon: 'pi pi-fw pi-book',
                to: '/documentation'
            },
            {
                label: 'View Source',
                icon: 'pi pi-fw pi-github',
                url: 'https://github.com/primefaces/sakai-vue',
                target: '_blank'
            }
        ]
    },
    {
        label: 'Seanet Component',
        items: [
            { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
            { label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
            { label: 'Button', icon: 'pi pi-fw pi-mobile', to: '/uikit/button', class: 'rotated-icon' },
            { label: 'Table', icon: 'pi pi-fw pi-table', to: '/uikit/table' },
            { label: 'List', icon: 'pi pi-fw pi-list', to: '/uikit/list' },
            { label: 'Tree', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree' },
            { label: 'Panel', icon: 'pi pi-fw pi-tablet', to: '/uikit/panel' },
            { label: 'Overlay', icon: 'pi pi-fw pi-clone', to: '/uikit/overlay' },
            { label: 'Media', icon: 'pi pi-fw pi-image', to: '/uikit/media' },
            { label: 'Menu', icon: 'pi pi-fw pi-bars', to: '/uikit/menu' },
            { label: 'Message', icon: 'pi pi-fw pi-comment', to: '/uikit/message' },
            { label: 'File', icon: 'pi pi-fw pi-file', to: '/uikit/file' },
            { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/charts' },
            { label: 'Timeline', icon: 'pi pi-fw pi-calendar', to: '/uikit/timeline' },
            { label: 'Misc', icon: 'pi pi-fw pi-circle', to: '/uikit/misc' }
        ]
    },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped>

</style>
