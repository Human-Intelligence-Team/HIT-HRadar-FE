<template>
  <div class="dept-list-page">
    <header class="page-header">
      <h1 class="page-title">조직도 및 부서 조회</h1>
      <p class="page-desc">회사의 전체 조직 구조와 부서 정보를 확인합니다.</p>
    </header>

    <div class="content-container">
      <!-- Organization Chart Section -->
      <section class="chart-section card">
        <h2 class="section-title">조직도</h2>
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>조직도를 불러오는 중입니다...</span>
        </div>
        <div v-else-if="orgChart && orgChart.length" class="tree-container">
          <ul class="tree-root">
            <li v-for="node in orgChart" :key="node.deptId">
              <div class="node-content">
                <span class="node-icon">🏢</span>
                <span class="node-name">{{ node.deptName }}</span>
                <span v-if="node.managerEmpId" class="node-manager">(ID: {{ node.managerEmpId }})</span>
              </div>
              <!-- Recursive Children -->
              <div v-if="node.children && node.children.length" class="node-children">
                 <DepartmentNode v-for="child in node.children" :key="child.deptId" :node="child" />
              </div>
            </li>
          </ul>
        </div>
        <div v-else class="empty-state">
          등록된 부서가 없습니다.
        </div>
      </section>
      
      <!-- List Table Section -->
       <section class="list-section card">
         <h2 class="section-title">부서 목록</h2>
         <div class="table-wrapper">
           <table class="data-table">
             <thead>
               <tr>
                 <th>부서명</th>
                 <th>부서 연락처</th>
                 <th>부서장 (ID)</th>
                 <th>생성일</th>
               </tr>
             </thead>
             <tbody>
               <tr v-for="dept in departments" :key="dept.deptId" @click="openDetailModal(dept)" class="clickable-row">
                 <td>{{ dept.deptName }}</td>
                 <td>{{ dept.deptPhoneNo || '-' }}</td>
                 <td>{{ dept.managerEmpId || '-' }}</td>
                 <td>{{ formatDate(dept.createdAt) }}</td>
               </tr>
               <tr v-if="departments.length === 0">
                 <td colspan="4" class="text-center">데이터가 없습니다.</td>
               </tr>
             </tbody>
           </table>
         </div>
      </section>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="modal-backdrop" @click.self="closeDetailModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">부서 상세 정보</h2>
          <button class="btn-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body" v-if="selectedDept">
          <div class="detail-item">
            <span class="label">부서명</span>
            <span class="value">{{ selectedDept.deptName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">부서 연락처</span>
            <span class="value">{{ selectedDept.deptPhoneNo || '-' }}</span>
          </div>
          <div class="detail-item">
             <span class="label">상위 부서 ID</span>
             <span class="value">{{ selectedDept.parentDeptId || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">부서장 ID</span>
            <span class="value">{{ selectedDept.managerEmpId || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">회사 ID</span>
            <span class="value">{{ selectedDept.companyId }}</span>
          </div>
          <div class="detail-item">
            <span class="label">생성일</span>
            <span class="value">{{ formatDate(selectedDept.createdAt) }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="closeDetailModal">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOrganizationChart, getAllDepartmentsByCompany } from '@/api/departmentApi'
// Recursive component for tree
import DepartmentNode from './components/DepartmentNode.vue'

const loading = ref(true)
const orgChart = ref([])
const departments = ref([])

// Modal State
const showDetailModal = ref(false)
const selectedDept = ref(null)

const openDetailModal = (dept) => {
  selectedDept.value = dept
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedDept.value = null
}

onMounted(async () => {
  await fetchData()
})

const fetchData = async () => {
  loading.value = true
  
  // Fetch Org Chart (Fail safe)
  try {
    const chartRes = await getOrganizationChart()
    orgChart.value = ensureArray(chartRes.data?.data)
  } catch (err) {
    console.warn('Failed to fetch org chart:', err)
  }

  // Fetch Department List
  try {
    const listRes = await getAllDepartmentsByCompany()
    // Try multiple possible response structures
    departments.value = ensureArray(listRes.data?.data?.departments || listRes.data?.data)
  } catch (err) {
    console.error('Failed to fetch department list:', err)
  } finally {
    loading.value = false
  }
}

const ensureArray = (data) => {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.children)) return [data] // Handle single root object
  return []
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.dept-list-page {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 40px;
}
.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}
.page-desc {
  color: #64748b;
  font-size: 1rem;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

/* Tree Styles */
.tree-container {
  padding: 12px;
  overflow-x: auto;
}
.tree-root {
  list-style: none;
  padding-left: 0;
}
.node-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 8px;
}
.node-name {
  font-weight: 600;
  color: #334155;
}
.node-manager {
  font-size: 0.85rem;
  color: #64748b;
}

/* Table Styles */
.table-wrapper {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.data-table th, .data-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}
.data-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
}
.data-table tr:last-child td {
  border-bottom: none;
}
.text-center { text-align: center; }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #64748b;
  gap: 16px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}
.clickable-row:hover {
  background-color: #f1f5f9;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}
.modal-content {
  background: white; width: 400px; border-radius: 16px; padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
.btn-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}
.detail-item:last-child { border-bottom: none; }
.detail-item .label { color: #64748b; font-weight: 500; }
.detail-item .value { color: #1e293b; font-weight: 600; text-align: right; }

.modal-footer { margin-top: 24px; text-align: right; }
.btn-primary {
  background: #0f172a; color: white; border: none; padding: 8px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
