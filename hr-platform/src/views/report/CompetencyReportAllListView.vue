<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import CompetencyReportCreateModal from '@/views/report/CompetencyReportCreateModal.vue'
import { YEAR_OPTIONS } from '@/views/report/script/common.js'
import {  fetchReportsByCycle } from '@/api/competencyReportApi.js'

const submitting = ref(false)
const errorMessage = ref('')
const router = useRouter()

const year = ref('')
const years = ref([])
const cycles = ref([])

const isCreateModalOpen = ref(false)

// 모달 오픈
const isModalOpen = () => {
  isCreateModalOpen.value = !isCreateModalOpen.value
  searchBtn()
}

// 상세 이동
const goDetailPage = (year, quarter) => {
  router.push({
    path: '/all/competency/report/employee',
    query: {
      type: 'all',
      year: year,
      quarter: quarter,
    },
  })
}

// 검색
const searchReport = async (params) => {
  submitting.value = true

  try {
    const result = await fetchReportsByCycle(params)
    const data = result.data

    if (data.success) {
      // 저장
      cycles.value = data.data.cycles
    }
  } catch (e) {
    errorMessage.value = e.message || '컨텐츠 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

// 초기화
function resetSearch() {
  year.value = ''
}

// 검색
function searchBtn() {
  let payload = {
    year: year.value,
  }

  // 검색
  searchReport(payload)
}

onMounted(() => {
  searchBtn()
  years.value = YEAR_OPTIONS()
})
</script>

<template>
  <div class="sub">역량강화 리포트 조회(인사팀)</div>

  <div class="grid">
    <div class="card">
      <div class="card-head">
        <div class="search-section">
          <div class="label">년도</div>
          <select class="select" v-model="year">
            <option value="">전체</option>
            <option v-for="item in years" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>

        <div class="search-btn">
          <button class="btn reset" @click="resetSearch()">초기화</button>
          <button class="btn primary search" @click="searchBtn">검색</button>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="section-btn">
      <button class="btn primary" @click="isModalOpen()" type="button">생성하기</button>
    </div>
    <table class="table">
      <thead class="tbl-hd">
        <tr>
          <th style="width: 10%">년도</th>
          <th style="width: 10%">회차</th>
          <th style="width: 30%">제목</th>
          <th style="width: 10%">담당자</th>
        </tr>
      </thead>
      <tbody
        class="tbl-bd"
        v-for="item in cycles"
        :key="item.cycleId"
        :value="item.cycleId"
      >
        <tr>
          <td>{{ item.year }}</td>
          <td>{{ item.quarter }}</td>
          <td @click="goDetailPage(item.year, item.quarter)">
            {{ item.cycleName }}
          </td>
          <td>{{ item.empName }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <CompetencyReportCreateModal
    v-if="isCreateModalOpen"
    @close="isModalOpen" />
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';


.section-btn {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 10px;
  padding-right: 10px;
}
</style>
