<template>
  <section class="page">
    <div class="page-header">
      <h1>부서 휴가 이력 (인사팀)</h1>
      <p>부서별, 직원별 휴가 사용 현황을 조회하고 관리합니다.</p>
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
            <!-- TODO: Load departments from API -->
            <option value="1">개발팀</option>
            <option value="2">인사팀</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="leave-type">휴가 종류</label>
          <select id="leave-type" v-model="filters.leaveType">
            <option value="">전체</option>
            <option value="ANNUAL">연차</option>
            <option value="SICK">병가</option>
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
                <td>{{ leave.departmentName }}</td>
                <td>{{ leave.employeeName }}</td>
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

const filters = ref({
  startDate: '',
  endDate: '',
  departmentId: '',
  leaveType: '',
  employeeName: '',
});

const isLoading = ref(true);
const allLeaves = ref([]); // This would be fetched from the backend
const filteredLeaves = ref([]);

// TODO: The backend needs an API to fetch department-wide leave data with filters.
// Mocking data for UI development purposes.
const mockData = [
  { leaveId: 101, requestedAt: '2024-07-28T10:00:00Z', departmentName: '개발팀', employeeName: '김개발', leaveType: '연차', startDate: '2024-08-01', endDate: '2024-08-02', reason: '여름 휴가', approvalStatus: 'APPROVED', leaveDays: 2 },
  { leaveId: 102, requestedAt: '2024-07-29T11:00:00Z', departmentName: '인사팀', employeeName: '이인사', leaveType: '연차', startDate: '2024-08-05', endDate: '2024-08-05', reason: '병원 진료', approvalStatus: 'APPROVED', leaveDays: 1 },
  { leaveId: 103, requestedAt: '2024-07-30T09:30:00Z', departmentName: '개발팀', employeeName: '박코더', leaveType: '병가', startDate: '2024-08-01', endDate: '2024-08-01', reason: '몸살', approvalStatus: 'REJECTED', leaveDays: 1 },
];

const applyFilters = () => {
    isLoading.value = true;
    console.log('Applying filters:', filters.value);
    // In a real scenario, this would be an API call with filter parameters.
    // Simulating filter logic here.
    setTimeout(() => {
        filteredLeaves.value = allLeaves.value.filter(leave => {
            const nameMatch = filters.value.employeeName ? leave.employeeName.includes(filters.value.employeeName) : true;
            const deptMatch = filters.value.departmentId ? leave.departmentName === (filters.value.departmentId === '1' ? '개발팀' : '인사팀') : true;
            // ... add other filter conditions
            return nameMatch && deptMatch;
        });
        isLoading.value = false;
    }, 500);
};

const resetFilters = () => {
    filters.value = {
        startDate: '',
        endDate: '',
        departmentId: '',
        leaveType: '',
        employeeName: '',
    };
    applyFilters();
};

const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const getStatusBadgeClass = (status) => {
    const classes = {
        'APPROVED': 'badge-green',
        'REJECTED': 'badge-red',
        'PROCEEDING': 'badge-blue',
    };
    return classes[status] || 'badge-gray';
}


onMounted(() => {
    allLeaves.value = mockData;
    filteredLeaves.value = mockData;
    isLoading.value = false;
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