<template>
  <section class="page">
    <!-- ================= 상단 타이틀 ================= -->
    <div class="section-title">
      <div>
        <h1>사원 대시보드</h1>
        <div class="sub">
          부서와 사원을 선택하여 개인 성과 대시보드를 확인합니다.
        </div>
      </div>
    </div>

    <!-- ================= 필터 카드 ================= -->
    <div class="filter-card">
      <div class="filter-item">
        <label>부서</label>
        <select v-model="selectedDeptId">
          <option disabled value="">부서 선택</option>
          <option v-for="d in departments" :key="d.id" :value="d.id">
            {{ d.name }}
          </option>
        </select>
      </div>

      <div class="filter-item">
        <label>사원</label>
        <select v-model="selectedEmpId" :disabled="!selectedDeptId">
          <option disabled value="">사원 선택</option>
          <option v-for="e in employees" :key="e.id" :value="e.id">
            {{ e.name }}
          </option>
        </select>
      </div>

      <div class="filter-hint">
        부서 선택 후 사원을 선택하세요
      </div>
    </div>

    <!-- ================= 대시보드 ================= -->
    <section v-if="selectedEmpId" class="dashboard-grid">
      <!-- 업무 기여도 -->
      <DashboardCard
        title="업무 기여도"
        desc="팀 목표 대비 개인 기여도"
      >
        <ContributionBarChart
          v-if="loaded.contribution"
          :categories="contribution.categories"
          :values="contribution.values"
        />
        <div v-else class="loading">불러오는 중...</div>
      </DashboardCard>

      <!-- 협업 지수 -->
      <DashboardCard
        title="협업 지수"
        desc="평가 결과 기반 협업 역량"
      >
        <CollaborationRadarChart
          v-if="loaded.collaboration"
          :labels="collaboration.labels"
          :values="collaboration.values"
          :max="collaboration.max"
        />
        <div v-else class="loading">불러오는 중...</div>
      </DashboardCard>

      <!-- 직무 만족도 -->
      <DashboardCard
        title="직무 만족도"
        desc="업무·환경·성장 관점 종합 분석"
        class="job-satisfaction-card"
      >
        <div class="job-satisfaction-layout">
          <JobSatisfactionGaugeChart
            :percentage="job.gauge.percentage"
          />
          <JobSatisfactionBarChart
            :labels="job.labels"
            :values="job.barValues"
          />
        </div>
      </DashboardCard>
      <!-- 업무 안정성 -->
      <DashboardCard
        title="업무 안정성"
        desc="최근 1년간 월별 이슈 발생 추이"
        class="job-satisfaction-card"
      >
        <JobStabilityLineChart
          v-if="stabilityLoaded"
          :labels="stability.labels"
          :values="stability.values"
        />
        <div v-else class="loading">불러오는 중...</div>
      </DashboardCard>

    </section>

    <div v-else class="empty-state">
      상단에서 부서와 사원을 선택해주세요
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import DashboardCard from '@/components/dashboard/DashboardCard.vue'
import ContributionBarChart from '@/components/dashboard/ContributionBarChart.vue'
import CollaborationRadarChart from '@/components/dashboard/CollaborationRadarChart.vue'
import JobSatisfactionBarChart from '@/components/dashboard/JobSatisfactionBarChart.vue'
import JobSatisfactionGaugeChart from '@/components/dashboard/JobSatisfactionGaugeChart.vue'
import dayjs from 'dayjs'
import JobStabilityLineChart from '@/components/dashboard/JobStabilityLineChart.vue'
import { fetchEmpJobStable } from '@/api/dashboardApi'
import { onMounted } from 'vue'
import {
  fetchEmpContribution,
  fetchEmpCollaboration,
  fetchEmpJobSatisfaction
} from '@/api/dashboardApi'

import {
  getAllDepartmentsByCompany,
  getDepartmentMembers
} from '@/api/departmentApi'

// =====부서 / 사원 =====
const departments = ref([])
const employees = ref([])


const selectedDeptId = ref('')
const selectedEmpId = ref('')

onMounted(async () => {
  const res = await getAllDepartmentsByCompany()

  departments.value = res.data.data.departments.map(d => ({
    id: d.deptId,
    name: d.deptName
  }))
})
// ===== 대시보드 상태 =====
const contribution = ref({ categories: [], values: [] })
const collaboration = ref({ labels: [], values: [], max: 100 })
const job = ref({ labels: [], barValues: [], gauge: { percentage: 0 } })

const loaded = ref({
  contribution: false,
  collaboration: false
})
const stability = ref({
  labels: [],
  values: []
})

const stabilityLoaded = ref(false)
const startYm = dayjs().subtract(6, 'month').format('YYYY-MM')
const endYm = dayjs().add(6, 'month').format('YYYY-MM')


// ===== Watch =====
watch(selectedDeptId, async deptId => {
  selectedEmpId.value = ''
  employees.value = []

  if (!deptId) return

  const res = await getDepartmentMembers(deptId)

  employees.value = res.data.data.employees.map(e => ({
    id: e.empId,
    name: e.name
  }))
})


watch(selectedEmpId, async empId => {
  if (!empId) return

  loaded.value.contribution = false
  loaded.value.collaboration = false
  stabilityLoaded.value = false

  const [c1, c2, c3, c4] = await Promise.all([
    fetchEmpContribution(empId),
    fetchEmpCollaboration(empId),
    fetchEmpJobSatisfaction(empId),
    fetchEmpJobStable(empId, startYm, endYm)
  ])

  contribution.value = c1.data.data
  collaboration.value = c2.data.data
  job.value = c3.data.data
  stability.value = c4.data.data

  loaded.value.contribution = true
  loaded.value.collaboration = true
  stabilityLoaded.value = true
})

</script>

<style scoped>
.page {
  padding: 24px;
}

.section-title {
  margin-bottom: 20px;
}

.section-title h1 {
  font-size: 22px;
  font-weight: 800;
}

.section-title .sub {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

/* ================= 필터 카드 ================= */
.filter-card {
  display: grid;
  grid-template-columns: 180px 180px 1fr;
  gap: 16px;
  align-items: end;
  background: linear-gradient(180deg, #f9fbff, #ffffff);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 24px rgba(99,102,241,0.08);
  margin-bottom: 28px;
}

.filter-item label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 6px;
}

.filter-item select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
}

.filter-item select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99,102,241,0.15);
}

.filter-hint {
  font-size: 12px;
  color: #9ca3af;
}

/* ================= 대시보드 ================= */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.job-satisfaction-card {
  grid-column: 1 / -1;
}

.job-satisfaction-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 28px;
  align-items: center;
}

.loading,
.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 40px 0;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .filter-card {
    grid-template-columns: 1fr;
  }

  .job-satisfaction-layout {
    grid-template-columns: 1fr;
  }
}
</style>
