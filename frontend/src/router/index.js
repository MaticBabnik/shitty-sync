import { createRouter, createWebHistory } from 'vue-router'
import NRoom from '@/views/Room.vue'
import NotFound from '@/views/Errors/NotFound.vue'
import Home from '@/views/Home.vue'
import VjsTest from '@/views/vjsTest.vue'
import Emotes from '@/views/emotes.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        title: 'Shitty sync | Home'
    },
    {
        path: '/room/:id/',
        name: 'NRoom',
        component: NRoom,
        title: 'Nr'
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
        title: 'Shitty sync | Not Found'
    },
    {
        path: '/test/',
        name: 'test',
        component: VjsTest,
        title: 'test'
    },{
        path: '/emotes/',
        name: 'emotes',
        component: Emotes,
        title: 'Emotes'
    },
]

const router = createRouter({
    history: createWebHistory(),
    mode: 'history',
    routes
})

export default router
