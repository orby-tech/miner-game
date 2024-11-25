import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/rooms/:roomId',
      name: 'room',
      component: () => import('../views/RoomView.vue'),
    },
    // default redirect to home
    {
      redirect: '/',
      path: '/:catchAll(.*)',
    },
  ],
})

export default router
