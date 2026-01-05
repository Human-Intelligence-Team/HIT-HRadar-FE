import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import PolicyView from '@/views/policy/PolicyView.vue'
import FaqView from '@/views/faq/FaqView.vue'
import NoticeView from '@/views/notice/NoticeView.vue'
import AlertView from '@/views/alert/AlertView.vue'

const routes = [
  { path: '/', redirect: '/policy' },

  { path: '/policy', component: PolicyView, meta: { permission: 'POLICY_READ' } },
  { path: '/faq', component: FaqView, meta: { permission: 'FAQ_MANAGE' } },
  { path: '/notice', component: NoticeView, meta: { permission: 'NOTICE_READ' } },
  { path: '/alert', component: AlertView, meta: { permission: 'ALERT_MANAGE' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const perm = to.meta.permission
  if (perm && !auth.hasPermission(perm)) {
    const fallback = auth.firstAccessiblePath()
    return fallback || false
  }
})

export default router
