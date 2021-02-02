import { createRouter, createWebHashHistory } from 'vue-router'
import Room from '../views/Room.vue'

const routes = [
    {
        path: '/',
        name: 'Room',
        component: Room,
        title:'shitty-sync'
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
