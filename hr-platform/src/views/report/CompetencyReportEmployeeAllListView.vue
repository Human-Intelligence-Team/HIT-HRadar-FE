<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import { fetchDeptOptions, fetchPositionOptions } from '@/views/report/script/common.js'
import { fetchReportsByAll } from '@/api/competencyReportApi.js'
const router = useRouter()
const route = useRoute()
const submitting = ref(false)
const errorMessage = ref('')

const deptOptions = ref([])
const pointOptions = ref([])
const reports = ref([])
const param_year = route.query.year
const param_quarter = route.query.quarter
const searchData = reactive({
  year: param_year,
  quarter: param_quarter,
  dept: '',
  position: '',
  employeeNo: '',
  employeeName: '',
})

const goDetailPage = (competencyReportId) => {
  router.push({
    path: `/me/competency/report/detail/${competencyReportId}`,
    query: {
      type: 'all',
    },
  })
}

const goListPage = () => {
  router.push({ path: '/all/competency/report' })
}

// 검색
const searchReport = async (params) => {
  submitting.value = true

  try {
    const result = await fetchReportsByAll(params)
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

// 부서 로딩
const loadDeptOptions = async () => {
  try {
    deptOptions.value = await fetchDeptOptions()
  } catch (e) {
    errorMessage.value = e.message || '부서 조회 중 오류 발생'
    alert(errorMessage.value)
  }
}

// 직급 로딩
const loadPositionOptions = async () => {
  try {
    pointOptions.value = await fetchPositionOptions()
  } catch (e) {
    errorMessage.value = e.message || '부서 조회 중 오류 발생'
    alert(errorMessage.value)
  }
}
// 검색
function searchBtn() {
  let payload = {
    year: searchData.year,
    quarter: searchData.quarter,
    deptId: searchData.dept,
    comPositionId: searchData.position,
    employeeNo: searchData.employeeNo,
    employeeName: searchData.employeeName,
  }

  // 검색
  searchReport(payload)
}

// 초기화
const resetSearch = () => {
  Object.keys(searchData).forEach((key) => {
    searchData[key] = ''
  })


}

onMounted(() => {
  searchBtn()
  loadDeptOptions()
  loadPositionOptions()
})
</script>

<template>
  <div class="sub">역량강화 리포트 사원별 조회(인사팀)</div>

  <div class="section-btn">
    <button class="btn" @click="goListPage()" type="button">목록</button>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-head">
        <div class="search-section">
          <div class="label">부서</div>
          <select class="select" v-model="searchData.dept">
            <option value="">전체</option>
            <option v-for="dept in deptOptions" :key="dept.deptId" :value="dept.deptId">
              {{ dept.deptName }}
            </option>
          </select>
        </div>

        <div class="search-section">
          <div class="label">직급</div>
          <select class="select" v-model="searchData.position">
            <option value="">전체</option>
            <option v-for="dept in pointOptions" :key="dept.positionId" :value="dept.positionId">
              {{ dept.name }}
            </option>
          </select>
        </div>

        <div class="search-section">
          <div class="label">사번</div>
          <input class="input" type="text" v-model="searchData.employeeNo" placeholder="사번" />
        </div>

        <div class="search-btn">
          <button class="btn reset" @click="resetSearch()">초기화</button>
          <button class="btn primary search" @click="searchBtn">검색</button>
        </div>
      </div>
      <div class="card-head">
        <div class="search-section">
          <div class="label">사원명</div>
          <input class="input" type="text" v-model="searchData.employeeName" placeholder="사원명" />
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
          <th style="width: 10%">부서</th>
          <th style="width: 10%">직급</th>
          <th style="width: 10%">사번</th>
          <th style="width: 10%">사원명</th>
          <th style="width: 30%">제목</th>
          <th style="width: 10%">담당자</th>
        </tr>
      </thead>
      <tbody
        class="tbl-bd"
        v-for="item in reports"
        :key="item.competencyReportId"
        :value="item.competencyReportId"
      >
        <tr>
          <td>{{ item.year }}</td>
          <td>{{ item.quarter }}</td>
          <td>{{ item.dept }}</td>
          <td>{{ item.position }}</td>
          <td>{{ item.employeeNo }}</td>
          <td>{{ item.employeeName }}</td>
          <td @click="goDetailPage(item.competencyReportId)">
            {{ item.title }}
          </td>
          <td>김사원</td>
        </tr>

      </tbody>
      <tr @click="goDetailPage(1001)">
        <td>2025</td>
        <td>1</td>
        <td>영업 1팀</td>
        <td>사원</td>
        <td>2344025</td>
        <td>김사원</td>
        <td>2025년 1분기 역량강화 리포트</td>
        <td>김사원</td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';
.section-btn {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  padding-right: 10px;
}
</style>
