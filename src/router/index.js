import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/question'
  },
  {
    path: '/question',
    name: 'question',
    component: () => import('../views/QuestionView.vue')
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('../views/UserView.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
