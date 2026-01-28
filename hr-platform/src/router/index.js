import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import PolicyView from '@/views/policy/PolicyView.vue'
import FaqView from '@/views/faq/FaqView.vue'
import NoticeView from '@/views/notice/NoticeView.vue'
import AlertView from '@/views/alert/AlertView.vue'

import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import LoginView from '@/views/auth/LoginView.vue'
import GoalListView from '@/views/goal/GoalListView.vue'
import HRGoalDashboard from '@/views/goal/HRGoalDashboard.vue'
import GoalDetailView from '@/views/goal/GoalDetailView.vue'
import TeamOwnerGoalListView from '@/views/goal/TeamOwnerGoalListView.vue'
import GoalCreateView from '@/views/goal/GoalCreateView.vue'
import CycleManageView from '@/views/cycle/CycleManageView.vue'
import CycleDetailPage from '@/views/cycle/CycleDetailPage.vue'
import CycleEditPage from '@/views/cycle/CycleEditPage.vue'
import CycleAdminManageView from '@/views/cycle/CycleAdminManageView.vue'
import CycleAdminDetailPage from '@/views/cycle/CycleAdminDetailPage.vue'
import CycleAdminEditPage from '@/views/cycle/CycleAdminEditPage.vue'
import CompanyGradeSettingPage from '@/views/grading/CompanyGradeSettingPage.vue'
import DeptGradeStatusPage from '@/views/grading/DeptGradeStatusPage.vue'
import AdminDeptGradeStatusPage from '@/views/grading/AdminDeptGradeStatusPage.vue'
import IndividualGradePage from '@/views/grading/IndividualGradePage.vue'
import IndividualGradeApprovePage from '@/views/grading/IndividualGradeApprovePage.vue'
import MygradePage from '@/views/grading/MygradePage.vue'
import AdminGradeObjectionPage from '@/views/grading/AdminGradeObjectionPage.vue'
import AdminGradeObjectionDetailPage from '@/views/grading/AdminGradeObjectionDetailPage.vue'

const routes = [
  {
    path: '/login',
    component: AuthLayout,
    children: [{ path: '', component: LoginView }],
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

      //성과평가-목표관리
      { path: 'goal', component: GoalListView },
      { path: 'hr/goals', component: HRGoalDashboard },
      { path: 'goal/:goalId', component: GoalDetailView},
      { path:'to/goals',component: TeamOwnerGoalListView},
      { path: '/goal/create', component: GoalCreateView},

      //회차
      { path: 'cycles', component: CycleManageView},
      { path: 'cycles/:cycleId/edit', component: CycleEditPage },
      { path: 'cycles/:cycleId',
        name: 'CycleDetail',
        component: CycleDetailPage},
      { path: 'hr/cycles', component: CycleAdminManageView},
      { path: 'hr/cycles/:cycleId', component: CycleAdminDetailPage},
      { path: '/hr/cycles/:cycleId/edit', component: CycleAdminEditPage},

      //등급
      { path: 'grade/setting', component: CompanyGradeSettingPage},
      { path: 'grading/list', component: DeptGradeStatusPage},
      { path: '/hr/grading/list', component: AdminDeptGradeStatusPage },
      { path: '/to/grading/list', component: IndividualGradePage },
      { path: '/hr/grading/list/approve', component: IndividualGradeApprovePage },
      { path: '/my/grading', component: MygradePage },
      { path: '/to/grading/objection', component: AdminGradeObjectionPage},
      { path: '/hr/objections/:objectionId', name: 'AdminGradeObjectionDetailPage',component:AdminGradeObjectionDetailPage }
    ],
  },
]

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
