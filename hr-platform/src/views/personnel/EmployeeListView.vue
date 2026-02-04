<template>
  <section>
    <div class="section-title">
      <div>
        <h1>사원 관리</h1>
        <div class="sub">소속 사원 명단을 확인하고 실시간 인사를 관리합니다.</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="이름 또는 사번 검색" 
          class="input search-input"
          @keyup.enter="loadEmployees"
        />
        <button class="btn primary" @click="loadEmployees">검색</button>
      </div>
      
      <div class="action-buttons" style="display: flex; gap: 8px;">
        <button class="btn outline" @click="openCsvModal">
            <i class="pi pi-upload"></i> 일괄 등록
        </button>
        <button class="btn primary outline" @click="openCreateModal">
            <i class="pi pi-plus"></i> 사원 등록
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">사원 정보를 불러오는 중...</div>
    
    <!-- Employee Table Component -->
    <EmployeeTable 
      v-else
      :employees="filteredEmployees"
      :dept-map="deptMap"
      :pos-map="posMap"
      :is-admin="true"
      @appointment="goToAppointment"
      @history="goToHistory"
      @edit="openEditModal"
      @delete="handleDelete"
      @view="openViewModal"
      @role="openRoleModal"
    />

    <!-- CRUD Form Modal -->
    <EmployeeFormModal 
      :visible="showFormModal"
      :edit-mode="isEditMode"
      :view-mode="isViewMode"
      :target-emp="selectedEmp"
      :departments="departments"
      :positions="positions"
      @close="showFormModal = false"
      @success="handleSuccess"
    />

    <!-- CSV 일괄 등록 모달 -->
    <EmployeeCsvUploadModal
        :visible="showCsvModal"
        @close="showCsvModal = false"
        @success="onCsvSuccess"
    />

    <!-- 역할 배정 모달 -->
    <RoleAssignmentModal
        :visible="showRoleModal"
        :target-emp="selectedEmp"
        @close="showRoleModal = false"
        @success="handleRoleSuccess"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchEmployees, deleteEmployee } from '@/api/employeeApi'
import { getAllDepartmentsByCompany } from '@/api/departmentApi'
import { fetchPositions } from '@/api/positionApi'
import EmployeeTable from '@/components/personnel/EmployeeTable.vue'
import EmployeeFormModal from '@/components/personnel/EmployeeFormModal.vue'
import EmployeeCsvUploadModal from '@/components/personnel/EmployeeCsvUploadModal.vue'
import RoleAssignmentModal from '@/components/personnel/RoleAssignmentModal.vue'

const router = useRouter()
const employees = ref([])
const searchQuery = ref('')
const loading = ref(false)

// 조회 데이터
const departments = ref([])
const positions = ref([])
const deptMap = ref({})
const posMap = ref({})

const showFormModal = ref(false)
const showCsvModal = ref(false)
const showRoleModal = ref(false) // 역할 배정 모달
const isEditMode = ref(false)
const isViewMode = ref(false)
const selectedEmp = ref(null)

// ...

const openCreateModal = () => {
  isEditMode.value = false
  isViewMode.value = false
  selectedEmp.value = null
  showFormModal.value = true
}

const openCsvModal = () => {
  showCsvModal.value = true
}

const openEditModal = (emp) => {
  isEditMode.value = true
  isViewMode.value = false
  selectedEmp.value = emp
  showFormModal.value = true
}

const openViewModal = (emp) => {
  isEditMode.value = false
  isViewMode.value = true
  selectedEmp.value = emp
  showFormModal.value = true
}

const openRoleModal = (emp) => {
  selectedEmp.value = emp
  showRoleModal.value = true
}

const onCsvSuccess = () => {
    loadEmployees()
}

const handleRoleSuccess = () => {
    loadEmployees()
}
// ...

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    // 병렬 데이터 조회
    const [empRes, deptRes, posRes] = await Promise.allSettled([
      fetchEmployees(),
      getAllDepartmentsByCompany(),
      fetchPositions()
    ])
    
    // 1. 사원 목록
    if(empRes.status === 'fulfilled') {
      const res = empRes.value
      let list = []
      const responseData = res.data?.data
      if (Array.isArray(res.data)) list = res.data
      else if (responseData?.employees && Array.isArray(responseData.employees)) list = responseData.employees
      else if (Array.isArray(responseData)) list = responseData
      else if (responseData?.content && Array.isArray(responseData.content)) list = responseData.content
      
      employees.value = list
    }
    
    // 2. 부서 매핑
    if(deptRes.status === 'fulfilled') {
       const dData = deptRes.value.data?.data || deptRes.value.data || []
       const dList = Array.isArray(dData) ? dData : (dData.departments || [])
       departments.value = dList // 리스트 저장
       // ID -> 이름 매핑
       const map = {}
       dList.forEach(d => { map[d.deptId] = d.deptName })
       deptMap.value = map
    }
    
    // 3. 직위 매핑
    if(posRes.status === 'fulfilled') {
       const pData = posRes.value.data?.data || posRes.value.data || []
       const pList = Array.isArray(pData) ? pData : (pData.positions || [])
       positions.value = pList // 리스트 저장
       const map = {}
       pList.forEach(p => { map[p.positionId] = p.name || p.positionName || p.posName })
       posMap.value = map
       console.log('✅ 직위 매핑 생성:', map)
    }

    // 디버그 로그
    if (employees.value.length > 0) {
      const sample = employees.value[0]
      console.log('🔍 첫 번째 사원 데이터:', {
        name: sample.name,
        posId: sample.positionId,
        posNameFromMap: posMap.value[sample.positionId],
        rawPosName: sample.posName
      })
    }


  } catch (e) {
    console.error('Fetch Failed', e)
    alert('데이터를 불러오지 못했습니다. 서버 상태를 확인해주세요. (500 Error 등)')
  } finally {
    loading.value = false
  }
}

// 새로고침 시 loadData 재사용
const loadEmployees = loadData

const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employees.value
  const q = searchQuery.value.toLowerCase()
  return employees.value.filter(e => 
    e.name?.toLowerCase().includes(q) || 
    e.employeeNo?.toLowerCase().includes(q) ||
    e.deptName?.toLowerCase().includes(q)
  )
})

const goToAppointment = (emp) => {
  const targetId = emp.empId || emp.userId
  router.push({ path: '/personnel/appointment', query: { empId: targetId } })
}

const goToHistory = (emp) => {
  const targetId = emp.empId || emp.userId
  router.push({ path: '/personnel/history', query: { empId: targetId } })
}

// --- CRUD 핸들러 ---

const handleDelete = async (emp) => {
  if(!confirm(`정말 ${emp.name} 사원을 삭제하시겠습니까?`)) return
  
  try {
    await deleteEmployee(emp.empId)
    alert('삭제되었습니다.')
    loadEmployees()
  } catch(e) {
    console.error(e)
    alert('삭제 실패: ' + (e.response?.data?.message || '오류 발생'))
  }
}

const handleSuccess = () => {
  loadEmployees()
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between; /* Space out search and add button */
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
