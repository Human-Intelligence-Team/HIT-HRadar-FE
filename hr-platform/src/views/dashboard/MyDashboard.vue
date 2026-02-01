<!--MyDashboard.vue-->
<template>
  <section class="page">
    <div class="chart-card">
      <div class="card-header">
        <div>
          <h3>나의 업무 기여도</h3>
          <p>팀 목표 대비 개인 기여도</p>
        </div>
      </div>

      <ContributionBarChart
        v-if="loaded"
        :categories="categories"
        :values="values"
      />
    </div>

    <div v-if="!loaded" class="loading">
      데이터를 불러오는 중입니다...
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ContributionBarChart from '@/components/dashboard/ContributionBarChart.vue'
import { fetchMyContribution } from '@/api/dashboardApi'


const categories = ref([])
const values = ref([])
const loaded = ref(false)

const loadContribution = async () => {
  try {
    const res = await fetchMyContribution()

    const payload = res.data.data

    categories.value = payload.categories
    values.value = payload.values
    loaded.value = true

  } catch (e) {
    console.error('❌ 기여도 조회 실패', e)
  }
}


onMounted(() => {
  loadContribution()
})
</script>

<style scoped>
.page {
  padding: 24px;
}

.section-title h2 {
  margin-bottom: 4px;
}

.section-title p {
  color: #666;
  font-size: 14px;
}

.chart-card {
  width: 100%;
  min-height: 320px;
}

.loading {
  margin-top: 40px;
  text-align: center;
  color: #999;
}
.chart-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
}
.chart-card {
  background: linear-gradient(180deg, #f9fbff, #ffffff);
  border-radius: 18px;
  padding: 20px 24px 24px;
  box-shadow: 0 12px 30px rgba(74,108,247,0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.card-header p {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}
</style>
