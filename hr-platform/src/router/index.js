import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import PolicyView from '@/views/policy/PolicyView.vue'
import FaqView from '@/views/faq/FaqView.vue'
import NoticeView from '@/views/notice/NoticeView.vue'
import AlertView from '@/views/alert/AlertView.vue'

import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import LoginView from '@/views/auth/LoginView.vue'


const routes = [
  {
    path: '/login',
    component: AuthLayout,
    children: [
      { path: '', component: LoginView },
    ],
  },

  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', redirect: '/policy' },
      { path: 'policy', component: PolicyView },
      { path: 'faq', component: FaqView },
      { path: 'notice', component: NoticeView },
      { path: 'alert', component: AlertView },
    ],
  },]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // 로그인 안 했는데 보호 페이지 접근
  if (!auth.isLoggedIn && to.path !== '/login') {
    return '/login'
  }

  // 로그인 했는데 로그인 페이지 접근
  if (auth.isLoggedIn && to.path === '/login') {
    return auth.firstAccessiblePath() || '/'
  }
})

export default router
