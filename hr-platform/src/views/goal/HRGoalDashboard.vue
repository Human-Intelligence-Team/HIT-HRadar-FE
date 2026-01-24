<template>
  <section>
    <!-- 헤더 -->
    <div class="section-title">
      <div>
        <h1>인사팀 목표 관리</h1>
        <div class="sub">조직별 KPI / OKR 현황 조회</div>
      </div>
    </div>

    <!-- 조직 선택 -->
    <BaseCard class="filter-card">
      <div class="filters">
        <select v-model="selectedDeptId" @change="onDeptChange">
          <option value="">조직 선택</option>
          <option
            v-for="dept in departments"
            :key="dept.id"
            :value="dept.id"
          >
            {{ dept.name }}
          </option>
        </select>

        <span class="hint">
          ※ 인사팀은 모든 조직의 목표를 조회할 수 있습니다.
        </span>
      </div>
    </BaseCard>

    <!-- 탭 -->
    <div class="tabs">

      <button
        class="tab"
        :class="{ active: activeTab === 'selected' }"
        @click="changeTab('selected')"
      >
        선택한 조직 목표
      </button>

      <button
        class="tab"
        :class="{ active: activeTab === 'myDept' }"
        @click="changeTab('myDept')"
      >
        내 소속 조직 목표
      </button>

      <button
        class="tab"
        :class="{ active: activeTab === 'me' }"
        @click="changeTab('me')"
      >
        내 목표
      </button>
    </div>

    <!-- Goal Tree -->
    <BaseCard>
      <div class="card-hd goal-hd">
        <span>목표명</span>
        <span>유형</span>
        <span>담당자</span>
        <span>상태</span>
        <span>진행률</span>
      </div>

      <div class="card-bd">
        <GoalTree :goals="goals" />
      </div>
    </BaseCard>
  </section>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import GoalTree from '@/views/goal/GoalTree.vue'
import {
  fetchOrganizationGoals,
  fetchMyGoals,
  fetchDepartmentGoals,
} from '@/api/goalApi.js'

/* 탭 상태 */
const activeTab = ref('myDept') // selected | myDept | me

/* 데이터 */
const goals = ref([])
const selectedDeptId = ref('')

/* TODO:임시 조직 목록 (나중에 API로 교체) */
const departments = ref([
  { id: 10, name: '개발팀' },
  { id: 20, name: '기획팀' },
  { id: 30, name: '영업팀' },
])

/* 조회 */
const loadGoals = async () => {
  let res

  if (activeTab.value === 'selected') {
    if (!selectedDeptId.value) {
      goals.value = []
      return
    }
    res = await fetchDepartmentGoals(selectedDeptId.value)
  }

  if (activeTab.value === 'myDept') {
    res = await fetchOrganizationGoals()
  }

  if (activeTab.value === 'me') {
    res = await fetchMyGoals()
  }

  goals.value = res?.data?.data ?? []
}

/* 탭 변경 */
const changeTab = async (tab) => {
  activeTab.value = tab
  await loadGoals()
}

/* 조직 변경 */
const onDeptChange = async () => {
  activeTab.value = 'selected'
  await loadGoals()
}

onMounted(loadGoals)
</script>
<style scoped>
/* 필터 */
.filter-card {
  margin-bottom: 12px;
}

.filters {
  display: flex;
  align-items: center;
  gap: 12px;
}

select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.hint {
  font-size: 12px;
  color: #6b7280;
}

/* 탭 */
.tabs {
  display: flex;
  gap: 8px;
  margin: 16px 0;
}

.tab {
  padding: 6px 16px;
  font-size: 13px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
}

.tab.active {
  background: #2563EB;
  color: white;
  border-color: #2563EB;
}

/* 헤더 */
.goal-hd {
  display: grid;
  grid-template-columns: 1fr 90px 120px 100px 220px;
  font-size: 13px;
  color: #6b7280;
}
</style>
