<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { fetchReportsByMe } from '@/api/competencyReportApi.js'
import { YEAR_OPTIONS } from '@/views/report/script/common.js'

const submitting = ref(false)
const errorMessage = ref('')
const router = useRouter()

const year = ref('')
const years = ref([])
const reports = ref([])

// 상세페이지 이동
const goDetailPage = (competencyReportId) => {
  router.push({
    path: `/me/competency/report/detail/${competencyReportId}`,
    query: {
      type: 'me',
    },
  })
}

// 검색
const searchReport = async (params) => {
  submitting.value = true

  try {
    const result = await fetchReportsByMe(params)
    const data = result.data

    if (data.success) {
      // 저장
      reports.value = data.data.reports
    }
  } catch (e) {
    errorMessage.value = e.message || '컨텐츠 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

// 검색
function searchBtn() {
  let payload = {
    year: year.value,
  }

  // 검색
  searchReport(payload)
}

// 초기화
function resetSearch() {
  year.value = ''
}

onMounted(() => {
  searchBtn()
  years.value = YEAR_OPTIONS()
})
</script>

<template>
  <div class="sub">역량강화 리포트 조회(본인)</div>

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
    <table class="table">
      <thead class="tbl-hd">
        <tr>
          <th style="width: 10%">년도</th>
          <th style="width: 10%">회차</th>
          <th style="width: 30%">제목</th>
        </tr>
      </thead>
      <tbody
        class="tbl-bd"
        v-for="item in reports"
        :key="item.competencyReportId"
        :value="item.competencyReportId"
        @click="goDetailPage(item.competencyReportId)"
      >
        <tr>
          <td>{{ item.year }}</td>
          <td>{{ item.quarter }}</td>
          <td>
            {{ item.cycleName }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';
</style>
