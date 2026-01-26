<!--CycleDetailPage.vue-->
<template>
  <section class="cycle-detail-page">
    <h2 class="page-title">평가 회차 상세</h2>

    <BaseCard v-if="cycle">
      <h4 class="section-title">회차 정보</h4>

      <div class="detail-grid">
        <div class="item">
          <label>회차명</label>
          <p>{{ cycle.cycleName }}</p>
        </div>

        <div class="item">
          <label>분기</label>
          <p>{{ quarterLabel(cycle.quarter) }}</p>
        </div>

        <div class="item">
          <label>기간</label>
          <p>
            {{ formatDate(cycle.startDate) }} ~
            {{ formatDate(cycle.endDate) }}
          </p>
        </div>

        <div class="item">
          <label>상태</label>
          <span class="badge" :class="statusClass(cycle.status)">
            {{ statusLabel(cycle.status) }}
          </span>
        </div>

        <div class="item">
          <label>담당자 ID</label>
          <p>{{ cycle.empId }}</p>
        </div>

        <div class="item">
          <label>역량 리포트 생성 여부</label>
          <p>
            {{ cycle.isCompReportGenerated === 'Y' ? '생성됨' : '미생성' }}
          </p>
        </div>
      </div>
    </BaseCard>

    <BaseCard class="mt" v-if="cycle">
      <h4 class="section-title">평가 유형</h4>

      <ul class="eval-types" v-if="cycle.evaluationTypes?.length">
        <li v-for="type in cycle.evaluationTypes" :key="type">
          {{ type }}
        </li>
      </ul>

      <p v-else class="hint">등록된 평가 유형이 없습니다.</p>
    </BaseCard>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import { fetchCycleDetail } from '@/api/cycleApi'

const route = useRoute()
const cycleId = route.params.cycleId

const cycle = ref(null)

const loadCycleDetail = async () => {
  const res = await fetchCycleDetail(cycleId)
  cycle.value = res.data
}

const formatDate = (dateTime) => {
  return dateTime.replace('T', ' ').slice(0, 16)
}

const statusLabel = (status) => {
  switch (status) {
    case 'DRAFT': return '작성 중'
    case 'IN_PROGRESS': return '진행 중'
    case 'CLOSED': return '종료'
    case 'APPROVED': return '확정'
    default: return status
  }
}

const statusClass = (status) => {
  switch (status) {
    case 'DRAFT': return 'draft'
    case 'IN_PROGRESS': return 'in-progress'
    case 'CLOSED': return 'closed'
    case 'APPROVED': return 'approved'
    default: return ''
  }
}

const quarterLabel = (quarter) => {
  switch (quarter) {
    case 'Q1': return '1분기'
    case 'Q2': return '2분기'
    case 'Q3': return '3분기'
    case 'Q4': return '4분기'
    default: return quarter
  }
}

onMounted(loadCycleDetail)
</script>

<style scoped>
.page-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  margin: 15px auto;
  padding: 0 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  padding: 0 24px 16px;
}

.item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item label {
  font-size: 12px;
  color: #6b7280;
}

.item p {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.badge {
  width: fit-content;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badge.draft {
  background: #f3f4f6;
  color: #374151;
}

.badge.in-progress {
  background: #e0f2fe;
  color: #0369a1;
}

.badge.closed {
  background: #fee2e2;
  color: #991b1b;
}

.badge.approved {
  background: #e0e7ff;
  color: #3730a3;
}

.eval-types {
  list-style: none;
  padding: 0 24px 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.eval-types li {
  background: #f3f4f6;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.mt {
  margin-top: 20px;
}

.hint {
  padding: 16px 24px;
  font-size: 13px;
  color: #6b7280;
}
</style>
