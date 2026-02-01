<template>
  <section class="page">
    <section class="dashboard-grid">
      <!-- 업무 기여도 -->
      <DashboardCard
        title="나의 업무 기여도"
        desc="팀 목표 대비 개인 기여도"
      >
        <ContributionBarChart
          v-if="loaded"
          :categories="categories"
          :values="values"
        />
        <div v-else class="loading">데이터를 불러오는 중입니다...</div>
      </DashboardCard>

      <!-- 협업 지수 -->
      <DashboardCard
        title="협업 지수"
        desc="평가 결과 기반 협업 역량 분석"
      >
        <CollaborationRadarChart
          v-if="collaborationLoaded"
          :labels="collaboration.labels"
          :values="collaboration.values"
          :max="collaboration.max"
        />
        <div v-else class="loading">데이터를 불러오는 중입니다...</div>
      </DashboardCard>
      <DashboardCard
        title="직무 만족도"
        desc="업무·환경·성장 관점 종합 분석"
        class="job-satisfaction-card"
      >
        <!--  여기! -->
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
        <div v-else class="loading">데이터를 불러오는 중입니다...</div>
      </DashboardCard>

    </section>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardCard from '@/components/dashboard/DashboardCard.vue'
import ContributionBarChart from '@/components/dashboard/ContributionBarChart.vue'
import CollaborationRadarChart from '@/components/dashboard/CollaborationRadarChart.vue'
import { fetchMyContribution, fetchMyCollaboration } from '@/api/dashboardApi'
import JobSatisfactionBarChart from '@/components/dashboard/JobSatisfactionBarChart.vue'
import JobSatisfactionGaugeChart from '@/components/dashboard/JobSatisfactionGaugeChart.vue'
import { fetchJobSatisfaction, fetchJobStable} from '@/api/dashboardApi'
import dayjs from 'dayjs'
import JobStabilityLineChart from '@/components/dashboard/JobStabilityLineChart.vue'


//업무 안정성
const stability = ref({
  labels: [],
  values: []
})
const stabilityLoaded = ref(false)

const now = dayjs()
const startYm = dayjs().subtract(6, 'month').format('YYYY-MM')
const endYm = dayjs().add(6, 'month').format('YYYY-MM')

const loadJobStable = async () => {
  const res = await fetchJobStable(startYm, endYm)
  stability.value = res.data.data
  stabilityLoaded.value = true
}

const categories = ref([])
const values = ref([])
const loaded = ref(false)

//업무 기여도
const loadContribution = async () => {
  const res = await fetchMyContribution()
  categories.value = res.data.data.categories
  values.value = res.data.data.values
  loaded.value = true
}

//협업 지수
const collaboration = ref({
  labels: [],
  values: [],
  max: 100
})
const collaborationLoaded = ref(false)

const loadCollaboration = async () => {
  const res = await fetchMyCollaboration()
  collaboration.value = res.data.data
  collaborationLoaded.value = true
}

//직무 만족도

const job = ref({
  labels: [],
  barValues: [],
  gauge: { average: 0, percentage: 0 }
})

const loadJob = async () => {
  const res = await fetchJobSatisfaction()
  job.value = res.data.data
  loaded.value = true
}

onMounted(() => {
  loadContribution()
  loadCollaboration()
  loadJob()
  loadJobStable()
})



</script>

<style scoped>

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.loading {
  text-align: center;
  color: #9ca3af;
  margin: 40px 0;
}
.job-satisfaction-card {
  grid-column: 1 / -1;
}
.job-satisfaction-card {
  grid-column: 1 / -1; /* 대시보드 가로 전체 */
}

.job-satisfaction-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 28px;
  align-items: center;
}

@media (max-width: 1024px) {
  .job-satisfaction-layout {
    grid-template-columns: 1fr;
  }
}

</style>
