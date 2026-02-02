import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import PolicyView from '@/views/policy/PolicyView.vue'
import PolicyDetailView from '@/views/policy/PolicyDetailView.vue'
import NoticeView from '@/views/notice/NoticeView.vue'
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
import CycleManageView from '@/views/cycle/CycleManageView.vue'
import CycleDetailPage from '@/views/cycle/CycleDetailPage.vue'
import CycleEditPage from '@/views/cycle/CycleEditPage.vue'
import CycleAdminManageView from '@/views/cycle/CycleAdminManageView.vue'
import CycleAdminDetailPage from '@/views/cycle/CycleAdminDetailPage.vue'
import CycleAdminEditPage from '@/views/cycle/CycleAdminEditPage.vue'
import CompanyGradeSettingPage from '@/views/grading/gradeSetting/CompanyGradeSettingPage.vue'
import DeptGradeStatusPage from '@/views/grading/deptGrade/DeptGradeStatusPage.vue'
import AdminDeptGradeStatusPage from '@/views/grading/deptGrade/AdminDeptGradeStatusPage.vue'
import IndividualGradePage from '@/views/grading/individualGrade/IndividualGradePage.vue'
import IndividualGradeApprovePage from '@/views/grading/individualGrade/IndividualGradeApprovePage.vue'
import MygradePage from '@/views/grading/individualGrade/MygradePage.vue'
import AdminGradeObjectionPage from '@/views/grading/gradeObjection/AdminGradeObjectionPage.vue'
import AdminGradeObjectionDetailPage from '@/views/grading/gradeObjection/AdminGradeObjectionDetailPage.vue'
import EvaluationTypeSetupPage from '@/views/evaluation/evalType/EvaluationTypeSetupPage.vue'
import EvaluationFormBuilderPage from '@/views/evaluation/evalQusetion/EvaluationFormBuilderPage.vue'
import EvaluationAssignmentSetupPage
  from '@/views/evaluation/evalAssignment/EvaluationAssignmentSetupPage.vue'
import EvaluationAssignmentStatusPage from '@/views/evaluation/evalAssignment/EvaluationAssignmentStatusPage.vue'
import EvaluationResponsePage from '@/views/evaluation/evaluationResponse/EvaluationResponsePage.vue'
import EvaluationResultPage from '@/views/evaluation/evaluationResponse/EvaluationResultPage.vue'
import EvaluationMyResultPage from '@/views/evaluation/evaluationResponse/EvaluationMyResultPage.vue'

import NoticeListView from '@/views/notice/NoticeListView.vue'
import NoticeDetailView from '@/views/notice/NoticeDetailView.vue'
import NoticeCreateView from '@/views/notice/NoticeCreateView.vue'
import NoticeEditView from '@/views/notice/NoticeEditView.vue'
import HomeView from '@/views/auth/HomeView.vue'
import CompanyRegisterView from '@/views/auth/CompanyRegisterView.vue'

import AdminLayout from '@/components/layout/AdminLayout.vue'
import AdminComAppList from '@/views/admin/AdminComAppList.vue'
import AdminUserAccountList from '@/views/admin/AdminUserAccountList.vue'
import ApprovalDocumentTypeManagementView from '@/views/admin/ApprovalDocumentTypeManagementView.vue'
import DepartmentListView from '@/views/department/DepartmentListView.vue'
import DepartmentManageView from '@/views/department/DepartmentManageView.vue'

import AttendanceIpPolicyView from '@/views/attendance/AttendanceIpPolicyView.vue'
import AttendanceCommuteView from '@/views/attendance/AttendanceCommuteView.vue'
import AttendanceDepartmentView from '@/views/attendance/AttendanceDepartmentView.vue'
import MyAttendanceCalendarView from '@/views/attendance/MyAttendanceCalendarView.vue'
import DepartmentAttendanceCalendarView from '@/views/attendance/DepartmentAttendanceCalendarView.vue'
import AttendanceEmployeeDetailView from '@/views/attendance/AttendanceEmployeeDetailView.vue'
import MyDashboard from '@/views/dashboard/MyDashboard.vue'
import EmpDashboard from '@/views/dashboard/EmpDashboard.vue'


const routes = [





  {
    path: '/register-company',
    component: CompanyRegisterView,
  },

  {
    path: '/home',
    component: AuthLayout,
    children: [
      { path: '', component: HomeView }
    ],
  },

  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'company-applications', component: AdminComAppList },
      { path: 'user-accounts', component: AdminUserAccountList },
      { path: 'approval-document-types', component: ApprovalDocumentTypeManagementView, meta: { requiresAdmin: true } },
      { path: 'permissions', component: () => import('@/views/admin/PermissionRegistryView.vue') },
    ]
  },

  {
    path: '/', component: AppLayout,
    children: [
      { path: '', redirect: '/policy' },
      {
        path: 'policy',
        children: [
          { path: '', name: 'policy', component: PolicyView },
          { path: ':id', name: 'policy-detail', component: PolicyDetailView, props: true },
        ]
      },
      {
        path: 'notice',
        component: NoticeView,
        children: [
          { path: '', name: 'notice-list', component: NoticeListView, meta: { permission: 'NOTICE_READ' } },
          { path: 'create', name: 'notice-create', component: NoticeCreateView, meta: { permission: 'NOTICE_MANAGE' } },
          { path: ':id', name: 'notice-detail', component: NoticeDetailView, props: true, meta: { permission: 'NOTICE_READ' } },
          { path: ':id/edit', name: 'notice-edit', component: NoticeEditView, props: true, meta: { permission: 'NOTICE_MANAGE' } },
        ]
      },

      // 조직/부서/사원 관리
      { path: 'organization', component: DepartmentListView, meta: { permission: 'DEPT_READ' } },
      { path: 'department/org-chart', component: () => import('@/views/department/OrganizationChartView.vue') }, // Organization Chart
      { path: 'department/manage', component: DepartmentManageView, meta: { permission: 'DEPT_MANAGE' } },
      { path: 'employee', component: () => import('@/views/personnel/EmployeeListView.vue') },
      { path: 'personnel/employees/list', component: () => import('@/views/personnel/EmployeeReadOnlyView.vue') }, // Read-Only Employee List
      { path: 'personnel/positions', component: () => import('@/views/personnel/PositionManageView.vue') },
      { path: 'personnel/positions/list', component: () => import('@/views/personnel/PositionReadOnlyView.vue') }, // Read-Only Position List


      // 인사 발령 및 이력
      { path: 'personnel/appointment', component: () => import('@/views/personnel/PersonnelAppointmentView.vue') },
      { path: 'personnel/history', component: () => import('@/views/personnel/PersonnelAppointmentHistoryView.vue') },

      // 회사 관리
      { path: 'company/my', component: () => import('@/views/company/MyCompanyView.vue') },
      { path: 'company/my-manage', component: () => import('@/views/company/MyCompanyManageView.vue'), meta: { permission: 'COMPANY_MANAGE' } },
      { path: 'company/roles', component: () => import('@/views/company/RoleManageView.vue'), meta: { permission: 'ROLE_MANAGE' } },
      { path: 'company/manage', component: () => import('@/views/company/CompanyManageView.vue'), meta: { permission: 'COMPANY_MANAGE' } },


      //성과평가-목표관리
      { path: 'goal', component: GoalListView },
      { path: 'hr/goals', component: HRGoalDashboard },
      { path: 'goal/:goalId', component: GoalDetailView },
      { path: 'to/goals', component: TeamOwnerGoalListView },
      { path: '/goal/create', component: GoalCreateView },
      {
        path: 'report', component: CompetencyReportView,
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
      {
        path: 'salary/basic', component: BasicSalaryView,
        children: [
          { path: '/all/salary/basic', component: BasicSalaryAllListView },
          { path: '/all/salary/basic/employee/:year', component: BasicSalaryEmployeeListView },
          { path: '/me/salary/basic', component: BasicSalarMeListView },
          { path: '/all/salary/basic/create', component: BasicSalaryCreateView },
          { path: '/all/salary/basic/detail/:basicId', component: BasicSalaryAllDetailView },
          { path: '/me/salary/history/:basicId', component: SalaryEmployeeHistoryView },
        ]
      },
      {
        path: 'salary/compensation', component: CompensationSalaryView,
        children: [
          { path: '/all/salary/compensation', component: CompensationSalaryAllListView },
          { path: '/all/salary/compensation/create', component: CompensationSalaryCreateView },
          { path: '/all/salary/compensation/detail/:compensationId', component: CompensationSalaryDetailView },
        ]
      },
      {
        path: 'contents', component: ContentsView,
        children: [
          { path: '/all/contents', component: ContentsListView },
          { path: '/all/contents/create', component: ContentsCreateView },
          { path: '/all/contents/update/:contentId', component: ContentsCreateView },
          { path: '/all/contents/detail/:contentId', component: ContentsDetailView, props: true }
        ]
      },
      {
        path: 'contents/tag', component: TagView
        , children: [
          { path: '/all/contents/tag', component: TagModalView },
        ]
      },

      //회차
      { path: 'cycles', component: CycleManageView },
      { path: 'cycles/:cycleId/edit', component: CycleEditPage },
      {
        path: 'cycles/:cycleId',
        name: 'CycleDetail',
        component: CycleDetailPage
      },
      { path: 'hr/cycles', component: CycleAdminManageView },
      { path: 'hr/cycles/:cycleId', component: CycleAdminDetailPage },
      { path: '/hr/cycles/:cycleId/edit', component: CycleAdminEditPage },

      //등급
      { path: 'grade/setting', component: CompanyGradeSettingPage },
      { path: 'grading/list', component: DeptGradeStatusPage },
      { path: '/hr/grading/list', component: AdminDeptGradeStatusPage },
      { path: '/to/grading/list', component: IndividualGradePage },
      { path: '/hr/grading/list/approve', component: IndividualGradeApprovePage },
      { path: '/my/grading', component: MygradePage },
      { path: '/to/grading/objection', component: AdminGradeObjectionPage },
      { path: '/hr/objections/:objectionId', name: 'AdminGradeObjectionDetailPage', component: AdminGradeObjectionDetailPage },

      //평가
      { path: '/hr/evaluation/type/setting', component: EvaluationTypeSetupPage },
      { path: '/hr/evaluation/question/form/setting', component: EvaluationFormBuilderPage },
      { path: '/hr/evaluation/assignment', component: EvaluationAssignmentSetupPage },
      { path: '/hr/evaluation/assignment/status', component: EvaluationAssignmentStatusPage },
      { path: '/evaluation/assignment/response', component: EvaluationResponsePage },
      { path: '/hr/evaluation/response/result', component: EvaluationResultPage },
      { path: '/evaluation/response/my/result', component: EvaluationMyResultPage },
      { path: '/to/grading/objection', component: AdminGradeObjectionPage },
      { path: '/hr/objections/:objectionId', name: 'AdminGradeObjectionDetailPage', component: AdminGradeObjectionDetailPage },
      { path: '/to/grading/objection', component: AdminGradeObjectionPage },
      { path: '/hr/objections/:objectionId', name: 'AdminGradeObjectionDetailPage', component: AdminGradeObjectionDetailPage },


      //대시보드
      { path: '/my/dashboard', component: MyDashboard },
      { path: '/hr/dashboard', component: EmpDashboard },


      {
        path: 'approval',
        children: [
          { path: 'create', component: () => import('@/views/approval/ApprovalCreateView.vue') },
          { path: 'my-documents', component: () => import('@/views/approval/ApprovalMyListView.vue') },
          { path: 'approval-tasks', component: () => import('@/views/approval/ApprovalInboxListView.vue') },
          { path: 'rejected-documents', component: () => import('@/views/approval/ApprovalRejectedListView.vue') },
          { path: 'references', component: () => import('@/views/approval/ApprovalReferenceListView.vue') },
          { path: 'all-documents', component: () => import('@/views/approval/ApprovalAllListView.vue') },
          { path: 'admin', component: () => import('@/views/admin/ApprovalDocumentTypeManagementView.vue') },
          { path: ':docId', component: () => import('@/views/approval/ApprovalDetailView.vue'), props: true },
        ],
      },

      // 근태 관리
      {
        path: 'attendance',
        redirect: '/attendance/commute', // 기본적으로 사원 출퇴근 관리 페이지로 리디렉션
        children: [
          { path: 'commute', component: AttendanceCommuteView }, // 사원 출퇴근 관리
          { path: 'ip-policy', component: AttendanceIpPolicyView }, // 인사팀 IP 정책 관리
          { path: 'department', component: AttendanceDepartmentView }, // 인사팀 부서 출퇴근 관리
          { path: 'my-calendar', component: MyAttendanceCalendarView }, // 나의 근태 캘린더
          { path: 'department-calendar', component: DepartmentAttendanceCalendarView }, // 부서별 근태 캘린더 (인사팀)
          { path: 'employee-detail/:employeeId/:workDate', name: 'AttendanceEmployeeDetail', component: AttendanceEmployeeDetailView, props: true }, // 사원 근태 상세 조회
        ],
      },

      // 휴가 관리
      {
        path: 'leave',
        children: [
          { path: 'my-history', component: () => import('@/views/leave/MyLeaveHistoryView.vue') },
          { path: 'policy', component: () => import('@/views/leave/LeavePolicyAdminView.vue') },
          { path: 'admin/department-history', component: () => import('@/views/leave/DepartmentLeaveHistoryView.vue'), meta: { requiresAdmin: true } },
        ],
      },

      // 마이페이지 (사용자 본인 정보)
      { path: 'my-profile', name: 'MyProfile', component: () => import('@/views/user/MyProfileView.vue') },
      { path: 'my-department', name: 'MyDepartment', component: () => import('@/views/department/MyDepartmentView.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {
  const auth = useAuthStore()

  const publicPaths = ['/home', '/register-company']
  const isPublic = publicPaths.includes(to.path)

  // 1. Not logged in -> Redirect to home (unless public)
  if (!auth.isLoggedIn) {
    if (!isPublic) {
      return { path: '/home', query: { redirect: to.fullPath } }
    }
    return // Allow public
  }

  // 2. Logged in as ADMIN -> Only Admin pages or landing
  if (auth.isAdmin) {
    const isAdminPath = to.path.startsWith('/admin')
    if (!isAdminPath && !isPublic) {
      return auth.firstAccessiblePath() || '/admin/company-applications'
    }
  }

  // 3. Logged in as USER -> No Admin pages & Check Permissions
  if (!auth.isAdmin) {
    const isAdminPath = to.path.startsWith('/admin')
    if (isAdminPath) {
      alert('접근 권한이 없습니다.')
      // If direct load (!from.matched.length), redirect. Otherwise stay (cancel).
      return from.matched.length > 0 ? false : '/policy'
    }

    // 세부 권한 체크 (route.meta.permission)
    if (to.meta.permission && !auth.hasPermission(to.meta.permission)) {
      alert('해당 메뉴에 대한 접근 권한이 없습니다.')
      // If direct load (!from.matched.length), redirect. Otherwise stay (cancel).
      return from.matched.length > 0 ? false : (auth.firstAccessiblePath() || '/policy')
    }

    // Redirect away from landing to main app
    if (isPublic) {
      return '/policy'
    }
  }
})

export default router
