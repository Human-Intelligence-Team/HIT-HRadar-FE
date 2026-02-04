<template>
  <section class="attendance-department-view">
    <!-- 헤더 -->
    <div class="view-header">
      <div class="title-group">
        <h1>부서 출퇴근 관리</h1>
      </div>
    </div>

    <!-- 필터 영역 -->
    <div class="filter-controls card">
      <div class="form-group">
        <label for="filterDate">날짜</label>
        <input type="date" id="filterDate" v-model="selectedDate" class="input-date" />
      </div>
      <div class="form-group">
        <label for="filterDepartment">부서</label>
        <select id="filterDepartment" v-model="selectedDepartmentId" class="select">
          <option value="">전체 부서</option>
          <option v-for="dept in departmentOptions" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
        </select>
      </div>
      <button class="btn primary" @click="fetchRecords">검색</button>
    </div>

    <!-- 출퇴근 기록 테이블 -->
    <div class="attendance-records-container card">
      <h3>출퇴근 기록</h3>
      <div v-if="loading" class="loading-indicator">데이터를 불러오는 중...</div>
      <div v-else-if="attendanceRecords.length === 0" class="no-results">
        해당 날짜와 부서의 출퇴근 기록이 없습니다.
      </div>
      <div v-else class="table-container">
        <table class="attendance-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>직급</th>
              <th>부서</th>
              <th>근무 유형</th>
              <th>근무 장소</th>
              <th>출근 시간</th>
              <th>퇴근 시간</th>
              <th>근무 시간</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in filteredRecords" :key="record.employeeId">
              <td>{{ record.name }}</td>
              <td>{{ record.jobTitle }}</td>
              <td>{{ record.department }}</td>
              <td>{{ record.workingType }}</td>
              <td>{{ record.workplace }}</td>
              <td>{{ record.clockInTime }}</td>
              <td>{{ record.clockOutTime }}</td>
              <td>{{ record.workingHours }}</td>
              <td><span :class="['status-badge', getRecordStatusClass(record.status)]">{{ record.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { getAllDepartmentsByCompany } from '@/api/departmentApi';

const auth = useAuthStore();
const companyId = computed(() => auth.user?.companyId);

const loading = ref(false);
const selectedDate = ref(new Date().toISOString().split('T')[0]); // 오늘 날짜로 초기화
const selectedDepartmentId = ref(auth.user?.deptId || ''); 
const departmentOptions = ref([]);
const attendanceRecords = ref([]);

// 부서 목록 가져오기 함수
const fetchDepartments = async () => {
    try {
        const response = await getAllDepartmentsByCompany();
        if (response.data?.success) {
             departmentOptions.value = response.data.data.departments.map(d => ({
                id: d.deptId,
                name: d.deptName
             }));

             // 사용자의 부서 ID가 목록에 없으면 첫 번째 부서 선택 (혹은 전체 선택)
             if (!selectedDepartmentId.value && departmentOptions.value.length > 0) {
                 selectedDepartmentId.value = departmentOptions.value[0].id;
             }
        }
    } catch (error) {
        console.error("부서 목록 조회 실패:", error);
    }
};

onMounted(() => {
    fetchDepartments();
    // 초기 로딩 시 데이터 조회 (부서 목록 로딩 후 fetchRecords가 watch에 의해 호출될 수도 있지만 명시적으로 호출)
    if (selectedDepartmentId.value) {
        fetchRecords();
    }
});

const fetchRecords = async () => {
  if (!companyId.value) {
    // alert('회사 정보를 불러올 수 없습니다.'); // 불필요한 알림 제거
    return;
  }
  loading.value = true;
  attendanceRecords.value = []; // 초기화

  try {
    let response;
    // ...

    // AttendanceListResponseDto[] 구조를 가정.
    // 각 DTO는 여러 직원의 기록을 포함할 수 있으므로, 단일 배열로 평탄화 필요.
    // 백엔드 AttendanceQueryController의 getAttendanceList 응답은 List<AttendanceListResponseDto>
    // AttendanceListResponseDto는 부서원이 한 명의 출결 기록을 나타내는 DTO
    // 이 예시에서는 단순화하여 각 AttendanceListResponseDto가 테이블의 한 행이 된다고 가정.
    const flatRecords = [];
    if (response.data && Array.isArray(response.data)) {
        response.data.forEach(deptRecord => {
            // 백엔드 AttendanceQueryController의 getAttendanceList 응답 DTO 구조에 맞춰 매핑
            // { employeeId, employeeName, departmentName, jobTitle, attendanceRecords: [{workDate, workPlace, workType, clockInTime, clockOutTime, workingHours, status}] }
            // 테이블은 한 사람의 하루 기록을 나타내므로, attendanceRecords 배열에서 해당 날짜 기록을 찾음
            if (deptRecord.attendanceRecords && deptRecord.attendanceRecords.length > 0) {
                // 단일 날짜 조회이므로 첫 번째 기록만 사용
                const record = deptRecord.attendanceRecords[0];
                flatRecords.push({
                    employeeId: deptRecord.employeeId,
                    name: deptRecord.employeeName,
                    jobTitle: deptRecord.jobTitle,
                    department: deptRecord.departmentName,
                    workingType: record.workType,
                    workplace: record.workPlace,
                    clockInTime: record.clockInTime ? record.clockInTime.substring(11, 16) : '-',
                    clockOutTime: record.clockOutTime ? record.clockOutTime.substring(11, 16) : '-',
                    workingHours: record.workingHours || '-',
                    status: record.status
                });
            } else {
                // 해당 날짜에 기록이 없는 경우
                flatRecords.push({
                    employeeId: deptRecord.employeeId,
                    name: deptRecord.employeeName,
                    jobTitle: deptRecord.jobTitle,
                    department: deptRecord.departmentName,
                    workingType: '-',
                    workplace: '-',
                    clockInTime: '-',
                    clockOutTime: '-',
                    workingHours: '-',
                    status: '기록 없음' // 또는 '미정'
                });
            }
        });
    }

    attendanceRecords.value = flatRecords;

  } catch (error) {
    console.error('부서 일일 근태를 불러오는 데 실패했습니다:', error);
  } finally {
    loading.value = false;
  }
};

const filteredRecords = computed(() => {
  return attendanceRecords.value; // API에서 이미 필터링되므로 추가 필터링 로직은 없음
});

const getRecordStatusClass = (status) => {
  switch (status) {
    case '정상': return 'status-normal';
    case '지각': return 'status-late';
    case '결근': return 'status-absent';
    case '미퇴근': return 'status-not-out';
    case '휴가': return 'status-leave';
    case '기록 없음': return 'status-no-record'; // 새로운 상태
    default: return '';
  }
};

// 날짜나 부서 필터가 변경되면 자동으로 검색 (API 재호출)
watch([selectedDate, selectedDepartmentId], () => {
  fetchRecords();
});
</script>

<style scoped>
.attendance-department-view {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  margin-bottom: 20px;
}

.title-group h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.title-group .sub {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.filter-controls {
  display: flex;
  gap: 15px;
  align-items: flex-end; /* 버튼과 정렬 */
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 14px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  flex-wrap: wrap; /* 반응형 */
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 5px;
}

.input-date,
.select {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  cursor: pointer;
  min-width: 150px;
}

.btn.primary {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 10px;
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  cursor: pointer;
}

.attendance-records-container {
  flex-grow: 1;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.attendance-records-container h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-top: 0;
  margin-bottom: 20px;
}

.loading-indicator, .no-results {
  text-align: center;
  padding: 50px 20px;
  font-size: 14px;
  color: #9ca3af;
}

.table-container {
  overflow-x: auto;
  flex-grow: 1;
  min-height: 0;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table th, .attendance-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  color: #374151;
}

.attendance-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #4b5563;
}

.attendance-table tbody tr:last-child td {
  border-bottom: none;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.status-badge.status-normal { background-color: #d1fae5; color: #065f46; } /* 정상 */
.status-badge.status-late { background-color: #fef3c7; color: #a16207; } /* 지각 */
.status-badge.status-absent { background-color: #fee2e2; color: #991b1b; } /* 결근 */
.status-badge.status-not-out { background-color: #e0e7ff; color: #1e40af; } /* 미퇴근 */
.status-badge.status-leave { background-color: #e5e7eb; color: #4b5563; } /* 휴가 */
.status-badge.status-no-record { background-color: #f3f4f6; color: #6b7280; } /* 기록 없음 */
</style>
