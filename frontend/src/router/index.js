import { createRouter, createWebHistory, isNavigationFailure } from 'vue-router'
import NotFound from '@/views/Errors/NotFoundView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'Sync'
    }
  },
  {
    path: '/room/:id/',
    name: 'Room',
    component: () => import('@/views/RoomView.vue'),
    meta: {
      title: 'Sync | Room'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: 'Not found'
    }
  },
  {
    // '/emotes' doesn't play nicely with nginx
    path: '/emote-list',
    name: 'emotes',
    component: () => import('@/views/EmotesView.vue'),
    meta: {
      title: 'Emotes'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  mode: 'history',
  routes
})

router.afterEach((to, from, fail) => {
  if (!isNavigationFailure(fail)) {
    document.title = to.meta.title
  }
})

export default router
