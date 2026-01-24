<!-- GoalListView.vue -->
<template>
  <section>
    <!-- 타이틀 + 탭 -->
    <div class="section-title">
      <div>
        <h1>목표 관리</h1>
        <div class="sub">
          {{ activeTab === 'org' ? '조직 전체 목표' : '내 목표' }}
        </div>
      </div>

      <div class="right-actions">
        <button class="btn primary">+ KPI 목표 등록</button>
        <button class="btn outline">+ OKR 목표 등록</button>
      </div>
    </div>

    <!-- 탭 -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'org' }"
        @click="changeTab('org')"
      >
        조직 목표
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'me' }"
        @click="changeTab('me')"
      >
        내 목표
      </button>
    </div>

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
import GoalTree from './GoalTree.vue'
import {
  fetchOrganizationGoals,
  fetchMyGoals,
} from '@/api/goalApi'

const goals = ref([])
const activeTab = ref('org') // 'org' | 'me'

const loadGoals = async () => {
  const res =
    activeTab.value === 'org'
      ? await fetchOrganizationGoals()
      : await fetchMyGoals()

  goals.value = res.data.data
}

const changeTab = async (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  goals.value = []
  await loadGoals()
}

onMounted(loadGoals)
</script>

<style scoped>
/* ===== Header ===== */
.goal-hd {
  display: grid;
  grid-template-columns: 1fr 90px 120px 100px 220px;
  font-size: 13px;
  color: #6b7280;
}

.right-actions {
  display: flex;
  gap: 8px;
}

/* ===== Tabs ===== */
.tabs {
  display: flex;
  gap: 8px;
  margin: 16px 0 12px;
}

.tab {
  padding: 6px 16px;
  font-size: 13px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
}

.tab.active {
  background: #2563EB;
  color: #ffffff;
  border-color: #2563EB;
}
</style>
