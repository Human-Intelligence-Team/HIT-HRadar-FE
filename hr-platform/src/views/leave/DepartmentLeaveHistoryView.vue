<template>
  <section class="page">
    <div class="page-header">
      <h1>부서 휴가 이력</h1>
    </div>

    <!-- 필터링 및 검색 -->
    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-field">
          <label for="date-range">기간</label>
          <div class="date-inputs">
            <input type="date" id="date-start" v-model="filters.startDate">
            <span>~</span>
            <input type="date" id="date-end" v-model="filters.endDate">
          </div>
        </div>
        <div class="filter-field">
          <label for="department">부서</label>
          <select id="department" v-model="filters.departmentId">
            <option value="">전체 부서</option>
            <option v-for="dept in departments" :key="dept.deptId" :value="dept.deptId">
              {{ dept.deptName }}
            </option>
          </select>
        </div>
        <div class="filter-field">
          <label for="leave-type">휴가 종류</label>
          <select id="leave-type" v-model="filters.leaveType">
            <option value="">전체</option>
            <option v-for="policy in leavePolicies" :key="policy.policyId" :value="policy.typeName">
              {{ policy.typeName }}
            </option>
          </select>
        </div>
        <div class="filter-field">
          <label for="employee-name">이름</label>
          <input type="text" id="employee-name" v-model="filters.employeeName" placeholder="사원명 검색">
        </div>
      </div>
      <div class="filter-actions">
        <button @click="resetFilters" class="btn-secondary">초기화</button>
        <button @click="applyFilters" class="btn-primary">조회</button>
      </div>
    </div>

    <!-- 부서 휴가 사용 기록 -->
    <div class="history-card">
      <h2>조회 결과</h2>
       <div v-if="isLoading" class="loading-state">
        <p>데이터를 불러오는 중입니다...</p>
      </div>
      <div v-else-if="filteredLeaves.length === 0" class="empty-state">
        <p>조회된 휴가 내역이 없습니다.</p>
      </div>
      <div v-else class="leave-table-container">
        <table class="leave-table">
            <thead>
                <tr>
                <th>신청일시</th>
                <th>부서</th>
                <th>이름</th>
                <th>휴가 종류</th>
                <th>기간</th>
                <th>사유</th>
                <th>결재결과</th>
                <th>차감일수</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="leave in filteredLeaves" :key="leave.leaveId">
                <td>{{ formatDateTime(leave.requestedAt) }}</td>
                <td>{{ leave.departmentName || '-' }}</td> <!-- Fallback if null -->
                <td>{{ leave.empName }}</td>
                <td>{{ leave.leaveType }}</td>
                <td>{{ leave.startDate }} ~ {{ leave.endDate }}</td>
                <td class="reason-cell">{{ leave.reason }}</td>
                <td>
                    <span :class="['badge', getStatusBadgeClass(leave.approvalStatus)]">
                        {{ leave.approvalStatus }}
                    </span>
                </td>
                <td>{{ leave.leaveDays }}일</td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDepartmentLeaves, getLeavePolicies } from '@/api/leaveApi';
import { getAllDepartmentsByCompany } from '@/api/departmentApi';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const leavePolicies = ref([]);
const departments = ref([]);

const filters = ref({
  startDate: '',
  endDate: '',
  departmentId: '',
  leaveType: '',
  employeeName: '',
});

const isLoading = ref(true);
const allLeaves = ref([]); 
const filteredLeaves = ref([]);


const applyFilters = () => {
    isLoading.value = true;
    console.log('Applying filters:', filters.value);
    
    // Client-side filtering because the backend endpoint returns all department leaves
    setTimeout(() => {
        filteredLeaves.value = allLeaves.value.filter(leave => {
            const nameMatch = filters.value.employeeName ? leave.empName.includes(filters.value.employeeName) : true;
            // Department filter: If departmentId is provided, filter by it. 
            // Note: Data might not have departmentId directly attached if not in DTO. 
            // We only requested departmentName in DTO. Filtering by ID might be tricky if we don't have ID.
            // Let's assume we filter by Name matching selected ID's name OR we should add deptId to DTO properly.
            // But wait, the task was about "Names matching".
            // Since we added departmentName to DTO, let's filter by Name or just fetch DeptId too?
            // Actually, we usually filtering by ID. let's add DeptId to DTO for robustness?
            // For now, let's skip complex ID filtering logic if ID is missing in DTO, or simple string match.
            // Let's assume for this specific User Request (Name Consistency) that Name display is key.
            // But wait! Use selected ID to find deptName from 'departments' array, then match string?
            
            let deptMatch = true;
            if (filters.value.departmentId) {
                 const selectedDept = departments.value.find(d => d.deptId === filters.value.departmentId);
                 if (selectedDept && leave.departmentName) {
                     deptMatch = leave.departmentName === selectedDept.deptName;
                 } else {
                     deptMatch = false; 
                 }
            }
            
            const typeMatch = filters.value.leaveType ? leave.leaveType === filters.value.leaveType : true;
            
            // Date Range Filter
            let dateMatch = true;
            if (filters.value.startDate && filters.value.endDate) {
                const start = new Date(filters.value.startDate);
                const end = new Date(filters.value.endDate);
                const leaveStart = new Date(leave.startDate);
                const leaveEnd = new Date(leave.endDate);
                // Check overlap
                dateMatch = leaveStart <= end && leaveEnd >= start;
            }

            return nameMatch && typeMatch && dateMatch && deptMatch;
        });
        isLoading.value = false;
    }, 300); // Small delay for UI feel
};

const resetFilters = () => {
    filters.value = {
        startDate: '',
        endDate: '',
        departmentId: '',
        leaveType: '',
        employeeName: '',
    };
    filteredLeaves.value = allLeaves.value;
};

const fetchData = async () => {
    isLoading.value = true;
    try {
        const [leavesRes, policiesRes, deptsRes] = await Promise.all([
            getDepartmentLeaves(),
            getLeavePolicies(authStore.user?.companyId),
            getAllDepartmentsByCompany()
        ]);

        if (leavesRes.data && leavesRes.data.success) {
            allLeaves.value = leavesRes.data.data;
            filteredLeaves.value = allLeaves.value;
        }
        
        if (policiesRes.data && policiesRes.data.success) {
            leavePolicies.value = policiesRes.data.data || [];
        }

        if (deptsRes.data && deptsRes.data.success) {
            departments.value = deptsRes.data.data.departments || [];
        }

    } catch (e) {
        console.error("Failed to fetch data:", e);
    } finally {
        isLoading.value = false;
    }
}

const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    // isoString could be just Date or DateTime
    const date = new Date(isoString);
    return date.toLocaleDateString('ko-KR'); 
}

const getStatusBadgeClass = (status) => {
    const classes = {
        'APPROVED': 'badge-green',
        'REJECTED': 'badge-red',
        'PENDING': 'badge-blue', // Changed from PROCEEDING to PENDING to match backend
        'WAITING': 'badge-gray',
        'IN_PROGRESS': 'badge-blue'
    };
    return classes[status] || 'badge-gray';
}


onMounted(() => {
    fetchData();
});

</script>

<style scoped>
.page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}
.page-header h1 { font-size: 1.8rem; font-weight: 700; }
.page-header p { font-size: 1rem; color: #6b7280; }

.filter-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.filter-field { display: flex; flex-direction: column; }
.filter-field label { font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
.filter-field input, .filter-field select { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 8px; }
.date-inputs { display: flex; align-items: center; gap: 0.5rem; }

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-primary, .btn-secondary {
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn-primary { background-color: #4f46e5; color: white; }
.btn-secondary { background-color: #e5e7eb; color: #1f2937; }

.history-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.history-card h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; }

.loading-state, .empty-state { text-align: center; padding: 3rem 0; color: #6b7280; }

.leave-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}
.leave-table th, .leave-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.9rem;
  vertical-align: middle;
}
.leave-table th { font-weight: 600; background-color: #f8f9fa; }
.reason-cell { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; }

.badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
.badge-blue { background-color: #e0e7ff; color: #3730a3; }
.badge-green { background-color: #d1fae5; color: #065f46; }
.badge-red { background-color: #fee2e2; color: #991b1b; }
.badge-gray { background-color: #f3f4f6; color: #4b5563; }
</style>