<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import { fetchBasicHistory, fetchBasicHistoryByMe } from '@/api/salaryApi.js'

const router = useRouter()
const route = useRoute()
const submitting = ref(false)
const errorMessage = ref('')
const empId = route.params.id
const year = route.query.year
const basic = ref([])

const goListPage = () => {
  router.push({ path: '/me/salary/basic' })
}

// 기본급 히스토리
const basicHistory = async () => {
  submitting.value = true

  let payload = {
    year: year,
  }

  try {
    const result = await fetchBasicHistoryByMe(payload)
    const data = result.data

    if (data.success) {
      console.log('성공!!!!!')
      basic.value = data.data.basicSalaryHistories
    }
  } catch (e) {
    errorMessage.value = e.message || '연봉 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  console.log('empId ' + empId)

  // 사원정보

  // 기본급 히스토리
  basicHistory()

  // 변동사항 히스토리
})
</script>

<template>
  <div class="sub">연봉 상세 조회</div>

  <div class="section-btn">
    <button class="btn" @click="goListPage()" type="button">목록</button>
  </div>

  <div class="salary-section">
    <div class="card">
      <h3>사원정보</h3>
      <div class="employee-section">
        <div class="card-content">
          <table class="table">
            <tr>
              <th>이름</th>
              <td></td>
              <th>사번</th>
              <td></td>
            </tr>
            <tr>
              <th>부서</th>
              <td></td>
              <th>직급</th>
              <td></td>
            </tr>
            <tr>
              <th>입사일</th>
              <td></td>
              <th>재직상태</th>
              <td></td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>기본급 정보</h3>
      <div class="basic-section">
        <div class="card-history">
          <table class="table-card">
            <tr>
              <th style="width: 10%">년도</th>
              <th style="width: 10%">인상사유</th>
              <th style="width: 10%">전 년도 연봉</th>
              <th style="width: 10%">변경 연봉</th>
              <th style="width: 10%">인상률</th>
              <th style="width: 10%">인상금액</th>
            </tr>
            <tr>
              <td>2025</td>
              <td>영업</td>
              <td>사원</td>
              <td>사원</td>
              <td>김사원</td>
              <td>김사원</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>변동 보상 히스토리</h3>
      <div class="compensation-section">
        <div class="search-box">
          <div class="search">
            <div class="label">종류</div>
            <select class="select">
              <option value="">전체</option>
            </select>
          </div>
        </div>

        <div class="card-history">
          <table class="table-card">
            <tr>
              <th style="width: 10%">종류</th>
              <th style="width: 10%">내용</th>
              <th style="width: 10%">금액</th>
              <th style="width: 10%">퍼센트(%)</th>
            </tr>
            <tr>
              <td>2025</td>
              <td>영업</td>
              <td>400,000</td>
              <td>0</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/views/contents/style/tableCss.css';
@import '@/views/salary/style/salaryTable.css';

.card {
  padding: 15px;
  margin-bottom: 15px;
}
.section-btn {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  padding-right: 10px;
  margin-bottom: 10px;
}
</style>
