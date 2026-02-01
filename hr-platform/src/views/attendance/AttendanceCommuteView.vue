<template>
  <section class="attendance-commute-view">
    <div class="view-header">
      <div class="title-group">
        <h1>나의 출퇴근 관리</h1>
      </div>
    </div>

    <div class="content-grid">
      <!-- 나의 출퇴근 관리 -->
      <div class="my-commute-card card">
        <h3>출퇴근 현황</h3>

        <!-- 로딩 상태 -->
        <div v-if="loading.myStatus" class="status-loading">
          <p>정보를 불러오는 중...</p>
        </div>

        <!-- 출근 완료 상태 -->
        <div v-else-if="clockInInfo" class="clock-in-info">
          <p class="current-time">{{ currentTime }}</p>
          <p class="current-status">현재 상태: <span class="status-in">출근 상태</span></p>
          <ul class="info-list">
            <li><strong>날짜:</strong> <span>{{ clockInInfo.workDate }}</span></li>
            <li><strong>출근 시간:</strong> <span>{{ clockInInfo.clockInTime }}</span></li>
            <li><strong>이름:</strong> <span>{{ clockInInfo.name }}</span></li>
            <li><strong>부서:</strong> <span>{{ clockInInfo.department }}</span></li>
            <li><strong>근무 유형:</strong> <span>{{ clockInInfo.workingType }}</span></li>
            <li><strong>근무 장소:</strong> <span>{{ clockInInfo.workplace }}</span></li>
            <li><strong>IP 주소:</strong> <span>{{ clockInInfo.ipAddress }}</span></li>
            <li><strong>초과근무 여부:</strong> <span>{{ clockInInfo.overtimeStatus }}</span></li>

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
            <li><strong>근무 유형:</strong> {{ initialWorkInfo?.workType || '-' }}</li>
            <li><strong>근무 장소:</strong> {{ initialWorkInfo?.workplace || '-' }}</li>
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
                <td colspan="6" class="no-results">등록된 부서원이 없습니다.</td>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import {
  processAttendance,
  fetchMyTodayAttendance,
  fetchAttendanceCalendar
} from '@/api/attendanceApi';

/* =====================
   기본 상태
===================== */
const auth = useAuthStore();
const employeeId = computed(() => auth.user?.employeeId);
const departmentId = computed(() => auth.user?.departmentId);
const userInfo = computed(() => auth.user);

const currentTime = ref('');
const loading = ref({
  myStatus: false,
  department: false
});

const clockInInfo = ref(null);

const initialWorkInfo = ref({
  workType: '-',
  workplace: '-'
});

const departmentMembers = ref([]);
let intervalId = null;

/* =====================
   유틸
===================== */
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ✅ 핵심: 시간 파싱 (형식 안 깨짐)
const extractTime = (v) => {
  if (!v) return '-';
  if (v.length === 8) return v;                    // HH:mm:ss
  if (v.includes('T')) return v.split('T')[1].slice(0, 8);
  return '-';
};

const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

/* =====================
   초기 데이터 로딩
===================== */
const fetchInitialData = async () => {
  if (!employeeId.value || !departmentId.value) return;

  loading.value.myStatus = true;
  try {
    const { data } = await fetchMyTodayAttendance(employeeId.value, getTodayString());

    if (data && data.checkInTime && !data.checkOutTime)  {
      // 출근한 상태 (퇴근 기록 없음)
      clockInInfo.value = {
        clockInTime: extractTime(data.checkInTime),
        name: userInfo.value?.name || '-',
        department: userInfo.value?.department || '-',
        workingType: data.workType || '-', // AttendanceDetailResponseDto에 workType이 있는지 확인 필요
        workplace: data.workPlace || 'OFFICE',
        ipAddress: data.ipAddress || '-',
        workDate: data.workDate || getTodayString(),
        overtimeStatus: data.overtimeStatus || '없음'
      };
    } else {
      // 미출근 또는 이미 퇴근함
      clockInInfo.value = null;
      initialWorkInfo.value.workType = data?.workType || '-';
      initialWorkInfo.value.workplace = data?.workPlace || '-';
    }
  } catch (e) {
    clockInInfo.value = null;
    initialWorkInfo.value.workType = '-';
    initialWorkInfo.value.workplace = '-';
  } finally {
    loading.value.myStatus = false;
  }

  /* 부서원 현황 */
  loading.value.department = true;
  try {
    const res = await fetchAttendanceCalendar({
      targetDeptId: departmentId.value,
      fromDate: getTodayString(),
      toDate: getTodayString()
    });

    departmentMembers.value = (res.data || []).map(d => {
      const r = d.attendanceRecords?.[0];
      return {
        employeeId: d.employeeId,
        name: d.employeeName,
        department: d.departmentName,
        jobTitle: d.jobTitle,
        status: r?.status || '기록 없음',
        workingHours: r?.workingHours || '-',
        workplace: r?.workPlace || '-'
      };
    });
  } catch (e) {
    departmentMembers.value = [];
  } finally {
    loading.value.department = false;
  }
};

/* =====================
   출퇴근 처리
===================== */
const clockInOut = async () => {
  loading.value.myStatus = true;
  try {
    const { data } = await processAttendance();

    const actionText = data.attendanceStatusType === 'CHECK_IN' ? '출근' : '퇴근';
    alert(`${actionText} 처리가 완료되었습니다.`);

    if (data.attendanceStatusType === 'CHECK_IN') {
      clockInInfo.value = {
        clockInTime: extractTime(data.checkInTime || data.clockInTime),
        name: userInfo.value?.name || '-',
        department: userInfo.value?.department || '-',
        workingType: data.workType || '-',
        workplace: data.workLocation || 'OFFICE',
        ipAddress: data.ipAddress || '-',
        workDate: data.workDate || getTodayString(),
        overtimeStatus: data.overtimeStatus || '없음'
      };
    } else {
      clockInInfo.value = null;
    }

  } catch (e) {
    alert(e.response?.data?.message || '출퇴근 처리 중 오류가 발생했습니다.');
  } finally {
    loading.value.myStatus = false;
  }
};

/* =====================
   상태 뱃지
===================== */
const getMemberStatusClass = (status) => {
  switch (status) {
    case '출근': return 'status-in';
    case '퇴근': return 'status-out';
    case '외근': return 'status-away';
    case '재택': return 'status-home';
    case '휴가': return 'status-leave';
    default: return '';
  }
};

/* =====================
   라이프사이클
===================== */
watch([employeeId, departmentId], ([newEmp, newDept]) => {
  if (newEmp && newDept) {
    fetchInitialData();
  }
}, { immediate: true });

onMounted(() => {
  updateCurrentTime();
  intervalId = setInterval(updateCurrentTime, 1000);
  // fetchInitialData() is now called by the watcher
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>


<style scoped>
.attendance-commute-view {
  height: auto;
  min-height: 100vh;
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
  min-height: auto;
}

.card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 0;
}

.card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-top: 0;
  margin-bottom: 20px;
}

.my-commute-card {
  overflow: visible;
  justify-content: flex-start;
  align-items: stretch;
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
  display: flex;
  flex-direction: column;
  align-items: center;   /* ✅ 블록 자체 가운데 */
}

.clock-in-info .info-list {
  list-style: none;
  padding: 0;
  margin: 20px 0 0;
  width: 100%;
  max-width: 420px;      /* ✅ 보기좋은 폭 */
}

.clock-in-info .info-list li {
  display: grid;
  grid-template-columns: 110px 1fr; /* ✅ 라벨/값 */
  align-items: center;
  column-gap: 12px;
  margin-bottom: 10px;
}

.clock-in-info .info-list li strong {
  width: auto;           /* ✅ 기존 80px 제거 */
  display: block;
  text-align: right;     /* 라벨은 오른쪽 정렬 */
}

.clock-in-info .info-list li span {
  text-align: left;      /* 값은 왼쪽 정렬 */
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
