import { createRouter, createWebHistory} from 'vue-router'
import Room from '@/views/Room.vue'
import NotFound from '@/views/Errors/NotFound.vue'
import Home from '@/views/Home.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        title:'Shitty sync | Home'
    },
    {
        path: '/room/:id',
        name: 'Room',
        component:Room,
        title:'Shitty sync'
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
        title: 'Shitty sync | Not Found'
    }
]

const router = createRouter({
    history: createWebHistory(),
    mode:'history',
    routes
})

export default router
