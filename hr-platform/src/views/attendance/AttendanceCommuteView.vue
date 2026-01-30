<template>
  <section class="attendance-commute-view">
    <div class="view-header">
      <div class="title-group">
        <h1>나의 출퇴근 관리</h1>
        <div class="sub">오늘의 출퇴근 기록 및 부서원 현황을 확인합니다.</div>
      </div>
    </div>

    <div class="content-grid">
      <!-- 나의 출퇴근 관리 -->
      <div class="my-commute-card card">
        <h3>나의 출퇴근 기록</h3>

        <!-- 로딩 상태 -->
        <div v-if="loading.myStatus" class="status-loading">
          <p>정보를 불러오는 중...</p>
        </div>

        <!-- 출근 완료 상태 -->
        <div v-else-if="clockInInfo" class="clock-in-info">
          <p class="current-time">{{ currentTime }}</p>
          <p class="current-status">현재 상태: <span class="status-in">출근 상태</span></p>
          <ul class="info-list">
            <li><strong>날짜:</strong> {{ clockInInfo.workDate }}</li>
            <li><strong>출근 시간:</strong> {{ clockInInfo.clockInTime }}</li>
            <li><strong>이름:</strong> {{ clockInInfo.name }}</li>
            <li><strong>부서:</strong> {{ clockInInfo.department }}</li>
            <li><strong>근무 유형:</strong> {{ clockInInfo.workingType }}</li>
            <li><strong>근무 장소:</strong> {{ clockInInfo.workplace }}</li>
            <li><strong>IP 주소:</strong> {{ clockInInfo.ipAddress }}</li>
            <li><strong>초과근무 여부:</strong> {{ clockInInfo.overtimeStatus }}</li>
          </ul>
          <button class="btn btn-clock-out" @click="clockInOut">퇴근하기</button>
        </div>

        <!-- 미출근 상태 -->
        <div v-else>
          <div class="commute-status">
            <p class="current-time">{{ currentTime }}</p>
            <p class="current-status">현재 상태: <span class="status-out">미출근</span></p>
          </div>
          <ul class="info-list">
            <li><strong>날짜:</strong> {{ getTodayString() }}</li>
            <li><strong>이름:</strong> {{ userInfo.value?.name || '-' }}</li>
            <li><strong>부서:</strong> {{ userInfo.value?.department || '-' }}</li>
            <li><strong>직급:</strong> {{ userInfo.value?.grade || '-' }}</li>
            <li><strong>근무 유형:</strong> {{ initialWorkInfo.value.workType || '-' }}</li>
            <li><strong>근무 장소:</strong> {{ initialWorkInfo.value.workplace || '-' }}</li>
          </ul>
          <button class="btn btn-clock-in" @click="clockInOut">
            출근하기
          </button>
        </div>
      </div>

      <!-- 부서원 출퇴근 현황 -->
      <div class="department-commute-card card">
        <h3>부서원 출퇴근 현황</h3>
        <div class="table-container">
          <table class="member-commute-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>부서</th>
                <th>직급</th>
                <th>상태</th>
                <th>근무 시간</th>
                <th>근무 장소</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading.department">
                <td colspan="6" class="no-results">부서원 현황을 불러오는 중...</td>
              </tr>
              <tr v-else-if="departmentMembers.length === 0">
                <td colspan="6" class="no-results">부서원 현황을 불러올 수 없습니다.</td>
              </tr>
              <template v-else>
                <tr v-for="member in departmentMembers" :key="member.employeeId">
                  <td>{{ member.name }}</td>
                  <td>{{ member.department }}</td>
                  <td>{{ member.jobTitle }}</td>
                  <td><span :class="['status-badge', getMemberStatusClass(member.status)]">{{ member.status }}</span></td>
                  <td>{{ member.workingHours }}</td>
                  <td>{{ member.workplace }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import {
  processAttendance,
  fetchMyTodayAttendance,
  fetchAttendanceCalendar
} from '@/api/attendanceApi';

const auth = useAuthStore();
const employeeId = computed(() => auth.user?.employeeId);
const departmentId = computed(() => auth.user?.departmentId);
const userInfo = computed(() => auth.user);

const currentTime = ref('');
const loading = ref({
  myStatus: false,
  department: false
});

// 출근 시 상세 정보를 저장할 ref
const clockInInfo = ref(null);

// 미출근 시 기본 근무 정보 (근무 유형, 근무 장소 등)
const initialWorkInfo = ref({
  workType: '-',
  workplace: '-'
});

const departmentMembers = ref([]);
let intervalId = null;

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const fetchInitialData = async () => {
  if (!employeeId.value || !departmentId.value) return;

  loading.value.myStatus = true;
  try {
    const response = await fetchMyTodayAttendance(employeeId.value, getTodayString());
    const data = response.data;

    if (data && data.clockInTime && !data.clockOutTime) {
      // 출근 상태
      clockInInfo.value = {
        clockInTime: new Date(data.clockInTime).toLocaleString('ko-KR'),
        name: userInfo.value?.name,
        department: userInfo.value?.department, // from auth store for now
        grade: userInfo.value?.grade, // from auth store for now
        workingType: data.workType,
        workplace: data.workPlace,
        ipAddress: data.ipAddress, // 이 정보가 응답에 포함되어 있다고 가정
        workDate: new Date(data.workDate).toLocaleDateString('ko-KR'), // assuming backend returns it
        overtimeStatus: data.overtimeStatus || '없음', // assuming backend returns it
      };
      // 출근 상태일 때는 initialWorkInfo 업데이트 불필요
    } else {
      // 미출근 또는 퇴근 완료 상태
      clockInInfo.value = null;
      if (data) {
        // 백엔드에서 받아온 근무 유형/장소를 initialWorkInfo에 저장
        initialWorkInfo.value.workType = data.workType || '-';
        initialWorkInfo.value.workplace = data.workPlace || '-';
      } else {
        initialWorkInfo.value.workType = '-';
        initialWorkInfo.value.workplace = '-';
      }
    }
  } catch (error) {
    console.error("오늘의 출근 상태를 불러오는 데 실패했습니다:", error);
    clockInInfo.value = null; // 오류 발생 시 출근하지 않은 것으로 간주
    initialWorkInfo.value.workType = '-';
    initialWorkInfo.value.workplace = '-';
  } finally {
    loading.value.myStatus = false;
  }

  // 부서원 출퇴근 현황 불러오기
  loading.value.department = true;
  try {
    const response = await fetchAttendanceCalendar({
      targetDeptId: departmentId.value,
      fromDate: getTodayString(),
      toDate: getTodayString()
    });
    // fetchMonthlyAttendance의 응답이 AttendanceListResponseDto[] 이므로, 이를 departmentMembers에 맞게 변환
    const transformedMembers = [];
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach(deptRecord => {
        // AttendanceListResponseDto는 특정 직원의 하루 근태 정보를 포함
        if (deptRecord.attendanceRecords && deptRecord.attendanceRecords.length > 0) {
          const record = deptRecord.attendanceRecords[0]; // 단일 날짜 조회이므로 첫 번째 기록 사용
          transformedMembers.push({
            employeeId: deptRecord.employeeId,
            name: deptRecord.employeeName,
            department: deptRecord.departmentName,
            jobTitle: deptRecord.jobTitle,
            status: record.status || '기록 없음',
            workingHours: record.workingHours || '-',
            workplace: record.workPlace || '-'
          });
        } else {
          transformedMembers.push({
            employeeId: deptRecord.employeeId,
            name: deptRecord.employeeName,
            department: deptRecord.departmentName,
            jobTitle: deptRecord.jobTitle,
            status: '기록 없음',
            workingHours: '-',
            workplace: '-'
          });
        }
      });
    }
    departmentMembers.value = transformedMembers;

  } catch (error) {
    console.error("부서원 출퇴근 현황을 불러오는 데 실패했습니다:", error);
  } finally {
    loading.value.department = false;
  }
};

const clockInOut = async () => {
  loading.value.myStatus = true;
  try {
    const response = await processAttendance();
    const data = response.data; // AttendanceCheckResponse
    const actionText = data.attendanceStatusType === 'CHECK_IN' ? '출근' : '퇴근';
    alert(`${actionText} 처리가 완료되었습니다.`);

    if (data.attendanceStatusType === 'CHECK_IN') {
      clockInInfo.value = {
        clockInTime: new Date(data.checkInTime).toLocaleString('ko-KR'), // from backend
        name: userInfo.value?.name,
        department: userInfo.value?.department, // from auth store for now
        grade: userInfo.value?.grade, // from auth store for now
        workingType: data.workType, // from backend
        workplace: data.workLocation, // from backend
        ipAddress: data.ipAddress, // from backend
        workDate: new Date(data.workDate).toLocaleDateString('ko-KR'), // from backend
        overtimeStatus: data.overtimeStatus || '없음', // from backend, default to '없음'
      };
    } else {
      // 퇴근 시 clockInInfo 초기화
      clockInInfo.value = null;
    }
    // UI 상태를 최신 정보로 다시 로드 (부서원 현황 등)
    await fetchInitialData();

  } catch (error) {
    console.error(`출퇴근 처리 실패:`, error);
    // API 에러 응답에서 메시지 추출 (구조는 실제 백엔드에 따라 다름)
    const errorMessage = error.response?.data?.message || '출퇴근 기록 중 오류가 발생했습니다. (예: 허용되지 않은 IP)';
    alert(errorMessage);
  } finally {
    loading.value.myStatus = false;
  }
};

const getMemberStatusClass = (status) => {
  switch (status) {
    case '출근': return 'status-in';
    case '퇴근': return 'status-out';
    case '외근': return 'status-away';
    case '재택': return 'status-home';
    case '휴가': return 'status-leave';
    case '기록 없음': return 'status-no-record'; // 추가
    default: return '';
  }
};

onMounted(() => {
  updateCurrentTime();
  intervalId = setInterval(updateCurrentTime, 1000);
  fetchInitialData();
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.attendance-commute-view {
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

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2단 레이아웃 */
  gap: 20px;
  flex-grow: 1;
  min-height: 0;
}

.card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-top: 0;
  margin-bottom: 20px;
}

.my-commute-card {
  align-items: center; /* 내부 요소 중앙 정렬 */
  justify-content: center;
}

.commute-status p {
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
}

.current-time {
  font-size: 32px;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 15px;
}

.current-status {
  font-size: 16px;
  font-weight: 500;
}

.status-in { color: #10b981; } /* 초록색 */
.status-out { color: #ef4444; } /* 빨간색 */

.commute-options {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.form-group label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 5px;
}

.select {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  cursor: pointer;
  min-width: 120px;
}

.btn {
  padding: 12px 25px;
  font-size: 16px;
  border-radius: 10px;
  border: none;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 150px;
  margin-bottom: 15px;
}

.btn-clock-in {
  background-color: #2563eb;
}

.btn-clock-in:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-clock-out {
  background-color: #ef4444;
}

.btn-clock-out:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.ip-status {
  font-size: 12px;
  color: #6b7280;
  margin-top: 10px;
}

.ip-status .status-success { color: #10b981; }
.ip-status .status-fail { color: #ef4444; }

.status-loading {
  text-align: center;
  padding: 50px 20px;
  font-size: 14px;
  color: #9ca3af;
}

.clock-in-info {
  width: 100%;
  text-align: center;
}

.clock-in-info .info-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  text-align: left;
  display: inline-block;
}

.clock-in-info .info-list li {
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
}

.clock-in-info .info-list li strong {
  font-weight: 600;
  color: #111827;
  width: 80px;
  display: inline-block;
}

.department-commute-card {
  /* 부서원 현황 카드는 특별한 정렬 없이 기본 flex column 유지 */
}

.table-container {
  overflow-x: auto;
  flex-grow: 1;
}

.member-commute-table {
  width: 100%;
  border-collapse: collapse;
}

.member-commute-table th, .member-commute-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  color: #374151;
}

.member-commute-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #4b5563;
}

.member-commute-table tbody tr:last-child td {
  border-bottom: none;
}

.member-commute-table .status-badge {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.member-commute-table .status-badge.status-in { background-color: #d1fae5; color: #065f46; } /* 출근 */
.member-commute-table .status-badge.status-out { background-color: #fee2e2; color: #991b1b; } /* 퇴근 */
.member-commute-table .status-badge.status-away { background-color: #fef9c3; color: #a16207; } /* 외근 */
.member-commute-table .status-badge.status-home { background-color: #e0f2fe; color: #075985; } /* 재택 */
.member-commute-table .status-badge.status-leave { background-color: #e5e7eb; color: #4b5563; } /* 휴가 */

.no-results {
  text-align: center;
  padding: 30px;
  color: #9ca3af;
  font-size: 14px;
}
</style>
