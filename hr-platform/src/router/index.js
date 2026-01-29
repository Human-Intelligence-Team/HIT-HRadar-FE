import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import PolicyView from '@/views/policy/PolicyView.vue'
import FaqView from '@/views/faq/FaqView.vue'
import NoticeView from '@/views/notice/NoticeView.vue'
import AlertView from '@/views/alert/AlertView.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import TagView from '@/views/contents/tag/TagView.vue'
import ContentsView from '@/views/contents/content/ContentsView.vue'
import SalaryDashboardView from '@/views/salary/SalaryDashboardView.vue'
import BasicSalaryView from '@/views/salary/basicSalary/BasicSalaryView.vue'
import CompensationSalaryView from '@/views/salary/compensationSalary/CompensationSalaryView.vue'
import ContentsCreateView from '@/views/contents/content/ContentsCreateView.vue'
import ContentsListView from '@/views/contents/content/ContentsListView.vue'
import ContentsDetailView from '@/views/contents/content/ContentsDetailView.vue'
import BasicSalaryAllListView from "@/views/salary/basicSalary/BasicSalaryAllListView.vue";
import BasicSalaryCreateView from "@/views/salary/basicSalary/BasicSalaryCreateView.vue";
import CompensationSalaryCreateView from "@/views/salary/compensationSalary/CompensationSalaryCreateView.vue";
import CompensationSalaryAllListView from "@/views/salary/compensationSalary/CompensationSalaryAllListView.vue";
import BasicSalaryAllDetailView from "@/views/salary/basicSalary/BasicSalaryAllDetailView.vue";
import CompensationSalaryDetailView from "@/views/salary/compensationSalary/CompensationSalaryDetailView.vue";
import BasicSalarMeListView from "@/views/salary/basicSalary/BasicSalarMeListView.vue";
import SalaryEmployeeHistoryView from "@/views/salary/basicSalary/SalaryEmployeeHistoryView.vue";
import BasicSalaryEmployeeListView
  from "@/views/salary/basicSalary/BasicSalaryEmployeeListView.vue";
import CompetencyReportView from "@/views/report/CompetencyReportView.vue";
import CompetencyReportAllListView from "@/views/report/CompetencyReportAllListView.vue";
import CompetencyReportDeptListView from "@/views/report/CompetencyReportDeptListView.vue";
import CompetencyReportMeListView from "@/views/report/CompetencyReportMeListView.vue";
import CompetencyReportAllCreateView
  from '@/views/report/CompetencyReportAllCreateView.vue'
import CompetencyReportEmployeeAllListView
  from '@/views/report/CompetencyReportEmployeeAllListView.vue'
import CompetencyReportDetailView
  from '@/views/report/CompetencyReportDetailView.vue'
import TagModalView from '@/views/contents/tag/TagModalView.vue'
import GoalListView from '@/views/goal/GoalListView.vue'
import HRGoalDashboard from '@/views/goal/HRGoalDashboard.vue'
import GoalDetailView from '@/views/goal/GoalDetailView.vue'
import TeamOwnerGoalListView from '@/views/goal/TeamOwnerGoalListView.vue'
import GoalCreateView from '@/views/goal/GoalCreateView.vue'
import HomeView from '@/views/auth/HomeView.vue'

const routes = [


  {
    path: '/home',
    component: AuthLayout,
    children: [{ path: '', component: HomeView }],
  },

  { path: '/', component: AppLayout,
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
      { path: 'report', component: CompetencyReportView ,
        children: [
          { path: '/all/competency/report', component: CompetencyReportAllListView },
          { path: '/all/competency/report/create', component: CompetencyReportAllCreateView },
          { path: '/all/competency/report/employee/:year', component: CompetencyReportEmployeeAllListView },
          { path: '/dept/competency/report', component: CompetencyReportDeptListView },
          { path: '/me/competency/report', component: CompetencyReportMeListView },
          { path: '/me/competency/report/detail/:competencyReportId', component: CompetencyReportDetailView },
        ]
      },
      { path: 'salary/dashboard', component: SalaryDashboardView },
      { path: 'salary/basic', component: BasicSalaryView,
        children: [
          { path: '/all/salary/basic', component: BasicSalaryAllListView },
          { path: '/all/salary/basic/employee/:year', component: BasicSalaryEmployeeListView },
          { path: '/me/salary/basic', component: BasicSalarMeListView },
          { path: '/all/salary/basic/create', component: BasicSalaryCreateView },
          { path: '/all/salary/basic/detail/:basicId', component: BasicSalaryAllDetailView },
          { path: '/me/salary/history/:basicId', component: SalaryEmployeeHistoryView },
        ]
      },
      { path: 'salary/compensation', component: CompensationSalaryView ,
        children: [
          { path: '/all/salary/compensation', component: CompensationSalaryAllListView },
          { path: '/all/salary/compensation/create', component: CompensationSalaryCreateView },
          { path: '/all/salary/compensation/detail/:compensationId', component: CompensationSalaryDetailView },
        ]
      },
      { path: 'contents', component: ContentsView ,
        children: [
          { path: '/all/contents', component: ContentsListView },
          { path: '/all/contents/create', component: ContentsCreateView },
          { path: '/all/contents/update/:contentId', component: ContentsCreateView },
          {path: '/all/contents/detail/:contentId', component: ContentsDetailView, props: true}
        ]},
      { path: 'contents/tag', component: TagView
        , children: [
          { path: '/all/contents/tag', component: TagModalView },
        ]
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  const publicPaths = ['/home']
  const isPublic = publicPaths.includes(to.path)

  // 로그인 안 했는데 보호 페이지 접근
  if (!auth.isLoggedIn && !isPublic) {
    return { path: '/home', query: { redirect: to.fullPath } }
  }

  // 로그인 했는데 /home 접근하면 첫 접근 가능 페이지로 보냄
  if (auth.isLoggedIn && isPublic) {
    const next = auth.firstAccessiblePath?.()
    // next가 '/', '/home', '' 같은 값이면 루프 나기 쉬우니 안전값 강제
    const safeNext =
      next && next !== '/' && next !== '/home' ? next : '/policy'

    return safeNext
  }
})

export default router
