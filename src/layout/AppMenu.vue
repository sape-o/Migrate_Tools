<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'ENGINEER',
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            {
                label: 'MIGRATIONS',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'ADDRESS',
                        icon: 'pi pi-fw pi-sign-in',
                        to: '/migration/migration-address'
                    },
                    {
                        label: 'ADDRESS GROUP',
                        icon: 'pi pi-fw pi-times-circle',
                        to: '/auth/error'
                    },
                    {
                        label: 'SERVICE',
                        icon: 'pi pi-fw pi-sign-in',
                        to: '/migration/migration-service'
                    },
                    {
                        label: 'SERVICE GROUP',
                        icon: 'pi pi-fw pi-times-circle',
                        to: '/auth/error'
                    },
                    {
                        label: 'POLICY',
                        icon: 'pi pi-fw pi-lock',
                        to: '/auth/access'
                    }
                ]
            },
        ]
    },
    {
        label: 'CHANGE',
        items: [
            { label: 'CHANGE REQUEST', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
            { label: 'CHANGE APPROVE', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
        ]
    },
        {
        label: 'ADMIN OFFICER',
        items: [
            { label: 'CHANGE REQUEST', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
            { label: 'CHANGE APPROVE', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
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
                        label: 'USER PRIVILEGE',
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
                            { label: 'MIGRATE 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'MIGRATE 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'MIGRATE 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                        ]
                    },
                    {
                        label: 'MIGRATE 1.2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [{ label: 'MIGRATE 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                    }
                ]
            },
            {
                label: 'CHANGE',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                    {
                        label: 'CHANGE 2.1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            { label: 'CHANGE 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'CHANGE 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                        ]
                    },
                    {
                        label: 'CHANGE 2.2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [{ label: 'CHANGE 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
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

<style lang="scss" scoped></style>
