import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import PolicyView from '@/views/policy/PolicyView.vue'
import NoticeView from '@/views/notice/NoticeView.vue'

import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import LoginView from '@/views/auth/LoginView.vue'

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
import ApprovalMyListView from '@/views/approval/ApprovalMyListView.vue'
import ApprovalInboxListView from '@/views/approval/ApprovalInboxListView.vue'
import ApprovalRejectedListView from '@/views/approval/ApprovalRejectedListView.vue'
import ApprovalAllListView from '@/views/approval/ApprovalAllListView.vue'
import ApprovalCreateView from '@/views/approval/ApprovalCreateView.vue'
import ApprovalAdminView from '@/views/approval/ApprovalAdminView.vue'

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
      { path: 'notice', component: NoticeView },

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

      {
        path: 'approval',
        children: [
          { path: 'my', component: ApprovalMyListView },          // 내 문서함
          { path: 'inbox', component: ApprovalInboxListView },    // 결재 문서함
          { path: 'rejected', component: ApprovalRejectedListView }, // 반려 문서함
          { path: 'all', component: ApprovalAllListView },
          { path: 'create', component: ApprovalCreateView },     // 전체 문서함(인사팀)
          { path: 'admin', component: ApprovalAdminView, meta: { requiresAdmin: true } }, // 결재 관리(인사팀)
        ],
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

  // 로그인 안 했는데 보호 페이지 접근
  if (!auth.isLoggedIn && to.path !== '/login') {
    return '/login'
  }

  // 로그인 했는데, 관리자 페이지에 권한 없이 접근
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    alert('접근 권한이 없습니다.');
    return '/notice'; // 혹은 권한 없음 페이지로
  }

  // 로그인 했는데 로그인 페이지 접근
  if (auth.isLoggedIn && to.path === '/login') {
    return auth.firstAccessiblePath() || '/'
  }
})

export default router
