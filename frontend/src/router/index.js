import { createRouter, createWebHistory} from 'vue-router'
import NRoom from '@/views/NewRoom.vue'
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
        path: '/nroom/:id/',
        name: 'NRoom',
        component:NRoom,
        title:'Nr' 
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
