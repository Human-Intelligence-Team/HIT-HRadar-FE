<template>
  <section>
    <div class="section-title">
      <div>
        <h1>사원 목록</h1>
        <div class="sub">전체 사원 명단을 조회합니다. (읽기 전용)</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <!-- 필터: 부서 -->
        <ModernSelect
          v-model="selectedDept"
          :options="deptOptions"
          placeholder="전체 부서"
          class="filter-select"
          @change="loadEmployees"
        />

        <!-- 필터: 직위 -->
        <ModernSelect
          v-model="selectedPos"
          :options="posOptions"
          placeholder="전체 직위"
          class="filter-select"
          @change="loadEmployees"
        />

        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="이름 또는 사번 검색" 
          class="input search-input"
          @keyup.enter="loadEmployees"
        />
        <button class="btn primary" @click="loadEmployees">검색</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">사원 정보를 불러오는 중...</div>
    
    <!-- Employee Table Component (Read Only) -->
    <EmployeeTable 
      v-else
      :employees="employees"
      :dept-map="deptMap"
      :pos-map="posMap"
      :is-admin="false"
      @view="openViewModal"
    />

    <!-- Detail View Modal -->
    <EmployeeFormModal 
      :visible="showFormModal"
      :edit-mode="false"
      :view-mode="true"
      :target-emp="selectedEmp"
      :departments="departments"
      :positions="positions"
      @close="showFormModal = false"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchEmployees } from '@/api/employeeApi'
import { getAllDepartmentsByCompany } from '@/api/departmentApi'
import { fetchPositions } from '@/api/positionApi'
import EmployeeTable from '@/components/personnel/EmployeeTable.vue'
import EmployeeFormModal from '@/components/personnel/EmployeeFormModal.vue'
import ModernSelect from '@/components/common/ModernSelect.vue'

const employees = ref([])
const searchQuery = ref('')
const selectedDept = ref(null) // 부서 필터
const selectedPos = ref(null)  // 직위 필터
const loading = ref(false)

// 조회 데이터
const departments = ref([])
const positions = ref([])
const deptMap = ref({})
const posMap = ref({})

// Computed Options
const deptOptions = computed(() => {
  const opts = departments.value.map(d => ({ label: d.deptName, value: d.deptId }))
  return [{ label: '전체 부서', value: null }, ...opts]
})

const posOptions = computed(() => {
  const opts = positions.value.map(p => ({ label: p.name || p.positionName || p.posName, value: p.positionId }))
  return [{ label: '전체 직위', value: null }, ...opts]
})

const showFormModal = ref(false)
const selectedEmp = ref(null)

const openViewModal = (emp) => {
  selectedEmp.value = emp
  showFormModal.value = true
}

onMounted(() => {
  loadInitData()
})

const loadInitData = async () => {
    // 1. 기초 데이터 (부서, 직위) 로드
    try {
        const [deptRes, posRes] = await Promise.allSettled([
            getAllDepartmentsByCompany(),
            fetchPositions()
        ])
        
        // 부서 매핑
        if(deptRes.status === 'fulfilled') {
           const dData = deptRes.value.data?.data || deptRes.value.data || []
           const dList = Array.isArray(dData) ? dData : (dData.departments || [])
           departments.value = dList
           const map = {}
           dList.forEach(d => { map[d.deptId] = d.deptName })
           deptMap.value = map
        }
        
        // 직위 매핑
        if(posRes.status === 'fulfilled') {
           const pData = posRes.value.data?.data || posRes.value.data || []
           const pList = Array.isArray(pData) ? pData : (pData.positions || [])
           positions.value = pList
           const map = {}
           pList.forEach(p => { map[p.positionId] = p.name || p.positionName || p.posName })
           posMap.value = map
        }
    } catch(e) {
        console.error("Init Data Load Fail", e)
    }
    
    // 2. 사원 목록 로드
    loadEmployees()
}

const loadData = async () => {
  loading.value = true
  try {
    // 검색 조건 구성 by Server
    const params = {}
    if (selectedDept.value) params.deptId = selectedDept.value
    if (selectedPos.value) params.positionId = selectedPos.value
    if (searchQuery.value) params.keyword = searchQuery.value // Keyword Search

    const empRes = await fetchEmployees(params)
    
    // 1. 사원 목록
    let list = []
    const responseData = empRes.data?.data
    if (Array.isArray(empRes.data)) list = empRes.data
    else if (responseData?.employees && Array.isArray(responseData.employees)) list = responseData.employees
    else if (Array.isArray(responseData)) list = responseData
    else if (responseData?.content && Array.isArray(responseData.content)) list = responseData.content
    
    employees.value = list

  } catch (e) {
    console.error('Fetch Failed', e)
    alert('데이터를 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
}

// 새로고침 시 loadData 재사용
const loadEmployees = loadData

// [Deleted] Client-side filtering logic
// const filteredEmployees = computed(() => ...)
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-start; /* Left align since no buttons on right */
  align-items: center;
  margin-bottom: 16px;
}
.search-box {
  display: flex;
  gap: 10px;
}
.search-input {
  width: 320px;
}
.search-input {
  width: 320px;
}
.filter-select {
  width: 160px !important;
}

/* Standardized Input Styling */
.input {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background: white;
  height: 42px; /* Consistent Height */
}
.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
/* Fix Autofill Yellow */
.input:-webkit-autofill,
.input:-webkit-autofill:hover, 
.input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.loading-state {
  text-align: center;
  padding: 80px;
  color: var(--text-muted);
  background: var(--card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
</style>
