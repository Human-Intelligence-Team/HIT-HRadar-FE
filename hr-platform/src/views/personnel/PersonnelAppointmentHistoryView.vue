<template>
  <section>
    <div class="section-title">
      <div>
        <h1>인사 이력 상세</h1>
        <div class="sub">전체 사원의 인사 발령 및 변동 이력을 조회합니다.</div>
      </div>
    </div>

    <div class="content-body">
      <!-- Search & Filter Toolkit -->
      <div class="toolbar">
        <div class="search-wrap">
          <i class="pi pi-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="사원 이름 검색..." 
            class="search-input"
          />
        </div>
      </div>

      <!-- History Table -->
      <div class="card history-card">
        <div v-if="loading" class="loading-state">
           <i class="pi pi-spin pi-spinner"></i>
           <p>데이터를 불러오는 중입니다...</p>
        </div>

        <div v-else-if="filteredHistories.length === 0" class="empty-state">
           <i class="pi pi-inbox"></i>
           <p>조회된 이력 데이터가 없습니다.</p>
        </div>
        
        <div v-else>
           <MovementHistoryTable 
             :histories="paginatedHistories"
             :departments="departments"
             :positions="positions"
             :show-employee-col="true"
           />
           
           <!-- Pagination -->
           <div class="pagination" v-if="totalPages > 1">
              <button 
                class="page-btn" 
                :disabled="currentPage === 1" 
                @click="currentPage--"
              >
                <i class="pi pi-chevron-left"></i>
              </button>
              <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
              <button 
                class="page-btn" 
                :disabled="currentPage === totalPages" 
                @click="currentPage++"
              >
                <i class="pi pi-chevron-right"></i>
              </button>
           </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import MovementHistoryTable from '@/components/personnel/MovementHistoryTable.vue'
import { fetchAllMovementHistories } from '@/api/employeeApi'
import { getAllDepartmentsByCompany } from '@/api/departmentApi'
import { fetchPositions } from '@/api/positionApi'

const loading = ref(false)
const histories = ref([])
const departments = ref([])
const positions = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 15

onMounted(async () => {
  loading.value = true
  await Promise.all([
    loadDepartments(),
    loadPositions(),
    loadAllHistories()
  ])
  loading.value = false
})

const loadAllHistories = async () => {
  try {
    const res = await fetchAllMovementHistories()
    if (res.data?.success) {
      console.log('History API Response:', res.data.data.histories) // Debug: Check if 'name' exists
      histories.value = res.data.data.histories || []
    }
  } catch (e) {
    console.error('Failed to load histories', e)
  }
}

// const getEmpName removed as backend now provides it

const loadDepartments = async () => {
  try {
    const res = await getAllDepartmentsByCompany()
    departments.value = res.data.data.departments || res.data.data || []
  } catch (e) { console.error(e) }
}

const loadPositions = async () => {
    try {
        const res = await fetchPositions()
        positions.value = res.data?.data?.positions || []
    } catch (e) { console.error(e) }
}

// Client-side Filter & Pagination
const filteredHistories = computed(() => {
  if (!searchQuery.value) return histories.value
  const q = searchQuery.value.toLowerCase()
  return histories.value.filter(h => 
    (h.empName && h.empName.toLowerCase().includes(q)) || // Changed to empName
    (h.eventReason && h.eventReason.toLowerCase().includes(q))
  )
})

const totalPages = computed(() => Math.ceil(filteredHistories.value.length / pageSize))

const paginatedHistories = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredHistories.value.slice(start, end)
})

// Reset page when search changes
watch(searchQuery, () => { currentPage.value = 1 })

</script>

<style scoped>
.toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.search-wrap {
  position: relative;
  width: 300px;
}
.search-wrap i {
  position: absolute;
  left: 12px; top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}
.search-input {
  width: 100%;
  padding: 10px 10px 10px 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #3b82f6; }

.history-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  min-height: 400px; /* Min height */
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #94a3b8;
  gap: 12px;
}
.loading-state i { font-size: 2rem; color: #3b82f6; }
.empty-state i { font-size: 3rem; opacity: 0.5; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #f1f5f9;
}
.page-btn {
  width: 32px; height: 32px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) { background: #f8fafc; color: #3b82f6; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-info { font-size: 14px; color: #475569; font-weight: 500; }
</style>
