<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import { fetchCompensationSalariesById } from '@/api/salaryApi.js'
import {
  fetchDeptOptions,
  fetchPositionOptions,
  LEAVE_STATUS_OPTIONS,
} from '@/views/report/script/common.js'
import { COMPENSATION_OPTIONS } from '@/views/salary/js/common.js'

const router = useRouter()
const route = useRoute()
const docId = route.params.docId
const submitting = ref(false)
const errorMessage = ref('')

const deptOptions = ref([])
const pointOptions = ref([])
const searchData = reactive({
  employmentType: '',
  deptId: '',
  comPositionId: '',
  employeeNo: '',
  employeeName: '',
})

const salaries = ref([])
const salaryApproval = reactive({
  title : ''
  , compensationType : ''
  , remark : ''
  , approvedAt : ''
  , approvalStatus : ''
  , writer : ''
  , totalSalary : ''
  , empCount : ''
})
const goListPage = () => {
  router.push({ path: '/all/salary/compensation' })
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
const searchReport = async (payload) => {
  submitting.value = true
  salaries.value = []

  try {
    const result = await fetchCompensationSalariesById(docId, payload)
    const data = result.data

    if (data.success) {
      salaries.value = data.data.compensationSalaries
      let approval = data.data.salaryApproval
      salaryApproval.title = approval.title
      salaryApproval.compensationType = approval.compensationType
      salaryApproval.remark = approval.remark
      salaryApproval.approvedAt = approval.approvedAt
      salaryApproval.approvalStatus = approval.approvalStatus
      salaryApproval.writer = approval.writer
      salaryApproval.totalSalary = approval.totalSalary
      salaryApproval.empCount = approval.empCount

      console.log("#### " + salaryApproval.title)

    }
  } catch (e) {
    errorMessage.value = e.message || '연봉 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

function searchBtn() {
  let payload = {
    employmentType: searchData.employmentType,
    deptId: searchData.deptId,
    comPositionId: searchData.comPositionId,
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
  loadDeptOptions()
  loadPositionOptions()
  searchBtn()
})
</script>

<template>
  <div class="sub">변동보상 사원 조회</div>

  <div class="section-btn">
    <button class="btn" @click="goListPage()" type="button">목록</button>
  </div>

  <div class="grid">
    <div class="card">
      <div><span><strong>{{ salaryApproval.title}}</strong></span></div>
      <div><span>{{ salaryApproval.compensationType}}</span></div>
      <div><span>{{ salaryApproval.remark}}</span></div>
      <div><span>{{ salaryApproval.approvedAt}}</span></div>
      <div><span>{{ salaryApproval.approvalStatus}}</span></div>
      <div><span>{{ salaryApproval.writer}}</span></div>
      <div><span>{{ salaryApproval.totalSalary}}</span></div>
      <div><span>{{ salaryApproval.empCount}}</span></div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-head">
        <div class="search-section">
          <span class="label">재직상태</span>
          <select class="select" v-model="searchData.employmentType">
            <option value="">전체</option>
            <option v-for="item in LEAVE_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>

        <div class="search-section">
          <div class="label">부서</div>
          <select class="select" v-model="searchData.deptId">
            <option value="">전체</option>
            <option v-for="dept in deptOptions" :key="dept.deptId" :value="dept.deptId">
              {{ dept.deptName }}
            </option>
          </select>
        </div>

        <div class="search-section">
          <div class="label">직급</div>
          <select class="select" v-model="searchData.comPositionId">
            <option value="">전체</option>
            <option v-for="dept in pointOptions" :key="dept.positionId" :value="dept.positionId">
              {{ dept.name }}
            </option>
          </select>
        </div>

        <div class="search-btn">
          <button class="btn reset" @click="resetSearch()">초기화</button>
          <button class="btn primary search" @click="searchBtn">검색</button>
        </div>
      </div>
      <div class="card-head">
        <div class="search-section">
          <div class="label">사번</div>
          <input class="input" type="text" v-model="searchData.employeeNo" placeholder="사번" />
        </div>

        <div class="search-section">
          <div class="label">사원명</div>
          <input class="input" type="text" v-model="searchData.employeeName" placeholder="사원명" />
        </div>

      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-bd">
      <table class="table">
        <thead class="tbl-hd">
          <tr>
            <th style="width: 10%">재직상태</th>
            <th style="width: 10%">부서</th>
            <th style="width: 10%">직급</th>
            <th style="width: 10%">사번</th>
            <th style="width: 10%">사원명</th>
            <th style="width: 10%">변동보상 유형</th>
            <th style="width: 20%">비고</th>
          </tr>
        </thead>
        <tbody class="tbl-bd">
          <tr v-for="item in salaries" :key="item.docId">
            <td>{{ item.employmentType }}</td>
            <td>{{ item.deptName }}</td>
            <td>{{ item.positionName }}</td>
            <td>{{ item.employeeNo }}</td>
            <td>{{ item.name }}</td>
            <td>
              <span v-for="type in COMPENSATION_OPTIONS" :key="type.value">
                <template v-if="type.value === item.compensationType">
                  {{ type.label }}
                </template>
              </span>
            </td>
            <td>{{ item.remark }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';

.section-btn {
  display: flex;
  justify-content: flex-end;
  padding: 5px;
}
</style>
