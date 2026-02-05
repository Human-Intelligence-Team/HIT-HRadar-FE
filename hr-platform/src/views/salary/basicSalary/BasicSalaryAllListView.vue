<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { fetchBasicSalaries } from '@/api/salaryApi.js'
import { APPROVAL_OPTIONS, BASIC_OPTIONS } from '@/views/salary/js/common.js'

const submitting = ref(false)
const errorMessage = ref('')
const router = useRouter()

const basic = ref([])
const goBasicCreate = () => {
  router.push({
    path: '/all/salary/create',
    query: {
      type: 'basic',
    },
  })
}

const goEmployeeListPage = (year) => {
  router.push(`/all/salary/basic/employee/${year}`)
}
// 검색
const searchSalaries = async () => {
  submitting.value = true

  try {
    const result = await fetchBasicSalaries()
    const data = result.data

    if (data.success) {
      // 저장
      basic.value = data.data.salaryApprovals
    }
  } catch (e) {
    errorMessage.value = e.message || '기본급 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  searchSalaries()
})
</script>

<template>
  <div class="sub">기본급 조회(인사팀)</div>
  <div class="card">
    <div class="dashboard-box">
      <div class="dashboard-box-header">
        <div class="dashboard-box-title">
          <span class="title">2026년 기본급 관리</span>
          <span class="sub-title">2026년 01월 01일 ~ 2026년 02월 01일</span>
        </div>
        <div>
          <button class="btn primary" @click="goBasicCreate()">등록하기</button>
        </div>
      </div>

      <div class="dashboard-box-body">
        <div class="amount-box">
          <span class="title">총 금액</span>
          <span class="content-font">85,000,000원</span>
        </div>
        <div class="chart-box">달 별 금액</div>
      </div>
    </div>
  </div>
  <div class="grid">
    <div class="card">
      <table class="table">
        <thead class="tbl-hd">
          <tr>
            <th style="width: 10%">년도</th>
            <th style="width: 10%">연봉인상유형</th>
            <th style="width: 30%">제목</th>
            <th style="width: 10%">총금액</th>
            <th style="width: 10%">인원</th>
            <th style="width: 10%">결재여부</th>
            <th style="width: 10%">결재일</th>
            <th style="width: 10%">담당자</th>
          </tr>
        </thead>
        <tbody class="tbl-bd">
          <tr v-for="item in basic" :key="item.docId">
            <td>{{ item.year }}</td>
            <td>
              <span v-for="type in BASIC_OPTIONS" :key="type.value">
                <template v-if="type.value === item.salaryIncreaseType">
                  {{ type.label }}
                </template>
              </span>
            </td>
            <td @click="goEmployeeListPage(item.docId)">{{ item.title }}</td>
            <td>{{ item.totalSalary }}</td>
            <td>{{ item.empCount }}</td>
            <td>
              <span v-for="type in APPROVAL_OPTIONS" :key="type.value">
                <template v-if="type.value === item.approvalStatus">
                  {{ type.label }}
                </template>
              </span>
            </td>
            <td>{{ item.approvedAt }}</td>
            <td>{{ item.writer }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@import '@/views/salary/style/salary.css';

.card {
  margin-top: 10px;
  padding: 20px;
}
</style>
