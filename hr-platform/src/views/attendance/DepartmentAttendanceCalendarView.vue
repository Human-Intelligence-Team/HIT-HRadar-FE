<template>
  <section class="attendance-dashboard">
    <!-- Left Column: Filters and Legends (1/3) -->
    <div class="dashboard-left">
      <div class="filter-card card premium-card">
        <div class="card-header">
          <h2>필터 및 범례</h2>
          <p class="sub-text">부서 및 사원을 선택하세요</p>
        </div>

        <div class="card-body">
          <div class="filter-group">
            <div class="filter-item">
              <label>부서 선택</label>
              <select v-model="selectedDepartmentId" class="select-field shadow-sm">
                <option v-for="dept in departmentOptions" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>

            <div class="filter-item">
              <label>사원 필터</label>
              <select v-model="selectedEmployeeId" class="select-field shadow-sm" :disabled="!selectedDepartmentId">
                <option value="">전체 사원</option>
                <option v-for="emp in employeeOptions" :key="emp.id" :value="emp.id">
                  {{ emp.name }}
                </option>
              </select>
            </div>

            <div class="filter-item">
              <div class="type-filter-header">
                <label>근무 유형</label>
                <button class="btn-text-only" @click="toggleAllFilters">
                  {{ selectedFilters.length === workTypes.length ? '전체 해제' : '전체 선택' }}
                </button>
              </div>
              <div class="category-list">
                <div
                  v-for="type in workTypes"
                  :key="type.key"
                  class="category-item"
                  :class="{ active: selectedFilters.includes(type.key) }"
                  @click="toggleFilter(type.key)"
                >
                  <span class="dot" :style="{ backgroundColor: type.color }"></span>
                  <span class="label">{{ type.label }}</span>
                  <span class="check-icon" v-if="selectedFilters.includes(type.key)">✓</span>
                </div>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="action-section">
            <button class="btn-refresh-premium" @click="refreshCalendar" :disabled="loading">
              <span v-if="loading" class="spinner-small"></span>
              <span v-else>🔄 새로고침</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Calendar (2/3) -->
    <div class="dashboard-right">
      <div class="calendar-card card premium-card">
        <div v-if="loading" class="loading-overlay">
          <div class="spinner"></div>
          <p>데이터를 불러오는 중입니다...</p>
        </div>
        <FullCalendar ref="fullCalendar" :options="calendarOptions" />
      </div>
    </div>

    <!-- Attendance Detail Modal -->
    <AttendanceDetailModal
      :is-open="isModalOpen"
      :attendance="selectedAttendance"
      @close="isModalOpen = false"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import AttendanceDetailModal from '@/components/attendance/AttendanceDetailModal.vue';
import { useAuthStore } from '@/stores/authStore';
import { getAllDepartmentsByCompany, getDepartmentMembers } from '@/api/departmentApi';
import { fetchAttendanceCalendar } from '@/api/attendanceApi';

const auth = useAuthStore();
const companyId = computed(() => auth.user?.companyId);

const fullCalendar = ref(null);
const isModalOpen = ref(false);
const selectedAttendance = ref(null);
const loading = ref(false);

const departmentOptions = ref([]);
const employeeOptions = ref([]);
const selectedDepartmentId = ref(auth.user?.departmentId || '');
const selectedEmployeeId = ref('');

const workTypes = [
  { key: 'OFFICE', label: '내근', color: '#3b82f6' },
  { key: 'REMOTE', label: '재택', color: '#8b5cf6' },
  { key: 'FIELD', label: '외근', color: '#10b981' },
  { key: 'TRIP', label: '출장', color: '#f59e0b' },
  { key: 'VACATION', label: '휴가', color: '#ef4444' }
];

const selectedFilters = ref(workTypes.map(t => t.key));
const rawEvents = ref([]);

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin, bootstrap5Plugin],
  initialView: 'dayGridMonth',
  events: [],
  headerToolbar: {
    left: 'title prev,next today',
    center: '',
    right: ''
  },
  locale: 'ko',
  dayMaxEvents: 5,
  height: '750px',
  eventClick: (info) => {
    selectedAttendance.value = {
      ...info.event.extendedProps,
      workDate: info.event.startStr,
    };
    isModalOpen.value = true;
  },
  datesSet: async (dateInfo) => {
    if (selectedDepartmentId.value) {
      await fetchCalendarEvents(dateInfo.startStr.substring(0, 10), dateInfo.endStr.substring(0, 10));
    }
  }
});

const fetchDepartments = async () => {
  try {
    const response = await getAllDepartmentsByCompany(companyId.value);
    if (response.data && response.data.success) {
      departmentOptions.value = response.data.data.departments.map(d => ({
        id: d.deptId,
        name: d.deptName
      }));

      if (!selectedDepartmentId.value && departmentOptions.value.length > 0) {
        selectedDepartmentId.value = departmentOptions.value[0].id;
      }
    }
  } catch (error) {
    console.error("Failed to fetch departments:", error);
  }
};

const fetchEmployees = async (deptId) => {
  if (!deptId) return;
  try {
    const response = await getDepartmentMembers(deptId);
    if (response.data && response.data.success) {
      const memberList = response.data.data.employees || response.data.data || [];
      if (Array.isArray(memberList)) {
        employeeOptions.value = memberList.map(m => ({
          id: m.empId || m.employeeId,
          name: m.name
        })).sort((a, b) => a.name.localeCompare(b.name));
      }
    }
  } catch (error) {
    console.error("Failed to fetch department members:", error);
  }
};

const fetchCalendarEvents = async (startDate, endDate) => {
  if (!selectedDepartmentId.value) return;

  loading.value = true;
  try {
    const response = await fetchAttendanceCalendar({
      targetDeptId: selectedDepartmentId.value,
      fromDate: startDate,
      toDate: endDate
    });

    const events = [];
    const attData = response.data?.data || response.data || [];

    if (Array.isArray(attData)) {
      attData.forEach(r => {
        events.push({
          id: `att-${r.empId}-${r.workDate}`,
          title: `${r.empName} (${r.status})`,
          start: r.workDate,
          backgroundColor: getEventColor(r.workType),
          borderColor: getEventColor(r.workType),
          extendedProps: {
            employeeId: r.empId,
            employeeName: r.empName,
            deptName: r.departmentName,
            workType: r.workType || 'OFFICE',
            status: r.status,
            location: r.location,
            checkInTime: r.checkInTime,
            checkOutTime: r.checkOutTime,
            overtimeMinutes: r.overtimeMinutes,
            profileImage: r.profileImage
          }
        });
      });
    }

    rawEvents.value = events;
    updateFilteredEvents();
  } catch (error) {
    console.error("Failed to fetch calendar data:", error);
  } finally {
    loading.value = false;
  }
};

const updateFilteredEvents = () => {
  let result = rawEvents.value;

  if (selectedEmployeeId.value) {
    result = result.filter(e => String(e.extendedProps.employeeId) === String(selectedEmployeeId.value));
  }

  result = result.filter(e => {
    const statusStr = String(e.extendedProps.status || '').toUpperCase();
    let key = 'OFFICE';

    if (statusStr.includes('재택')) key = 'REMOTE';
    else if (statusStr.includes('외근')) key = 'FIELD';
    else if (statusStr.includes('출장')) key = 'TRIP';
    else if (statusStr.includes('휴가') || statusStr.includes('병가') || statusStr.includes('반차')) key = 'VACATION';
    else if (statusStr.includes('출근') || statusStr.includes('퇴근')) key = 'OFFICE';

    return selectedFilters.value.includes(key);
  });

  calendarOptions.value.events = result;
};

watch(selectedDepartmentId, async (newVal) => {
  if (newVal) {
    await fetchEmployees(newVal);
    selectedEmployeeId.value = '';
    refreshCalendar();
  }
});

watch([selectedEmployeeId, selectedFilters], () => {
  updateFilteredEvents();
}, { deep: true });

const refreshCalendar = () => {
  if (fullCalendar.value) {
    const calendarApi = fullCalendar.value.getApi();
    calendarApi.refetchEvents();
  }
};

const getEventColor = (workType) => {
  const type = String(workType || '').toUpperCase();
  if (type.includes('REMOTE')) return '#8b5cf6';
  if (type.includes('FIELD')) return '#10b981';
  if (type.includes('TRIP')) return '#f59e0b';
  if (type.includes('VACATION') || type.includes('SICK_LEAVE') || type.includes('HALF_')) return '#ef4444';
  return '#3b82f6';
};

const toggleAllFilters = () => {
  if (selectedFilters.value.length === workTypes.length) {
    selectedFilters.value = [];
  } else {
    selectedFilters.value = workTypes.map(t => t.key);
  }
};

const toggleFilter = (key) => {
  const index = selectedFilters.value.indexOf(key);
  if (index > -1) {
    selectedFilters.value.splice(index, 1);
  } else {
    selectedFilters.value.push(key);
  }
};

onMounted(async () => {
  await fetchDepartments();
  if (selectedDepartmentId.value) {
    await fetchEmployees(selectedDepartmentId.value);
  }
});
</script>

<style scoped>
.attendance-dashboard {
  display: flex;
  gap: 24px;
  padding: 24px;
  background-color: #f8fafc;
  min-height: calc(100vh - 64px);
  width: 100%;
  box-sizing: border-box;
  font-family: 'Pretendard', -apple-system, sans-serif;
}

.dashboard-left {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-right {
  flex: 1;
  min-width: 0;
}

.card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.premium-card {
  overflow: hidden;
}

.card-header {
  padding: 24px 24px 0 24px;
  margin-bottom: 20px;
}

.card-header h2 {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.5px;
}

.sub-text {
  font-size: 13px;
  color: #94a3b8;
  margin: 4px 0 0 0;
}

.card-body {
  padding: 0 24px 24px 24px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item label {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
}

.type-filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-text-only {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.btn-text-only:hover {
  text-decoration: underline;
}

.select-field {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  background-color: #f8fafc;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.select-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  border: 1.5px solid transparent;
}

.category-item:hover {
  background: #f1f5f9;
}

.category-item.active {
  background: white;
  border-color: #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.category-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 12px;
}

.category-item .label {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  flex: 1;
}

.category-item .check-icon {
  color: #3b82f6;
  font-weight: bold;
}

.divider {
  height: 1.5px;
  background: #f1f5f9;
  margin: 8px 0;
}

.action-section {
  padding-top: 8px;
}

.btn-refresh-premium {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  background: #3b82f6;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-refresh-premium:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-refresh-premium:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.calendar-card {
  padding: 30px;
  height: 100%;
  min-height: 800px;
  position: relative;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(2px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-overlay p {
  color: #64748b;
  font-weight: 500;
  font-size: 14px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

:deep(.fc) {
  --fc-border-color: #f1f5f9;
  --fc-button-bg-color: #ffffff;
  --fc-button-border-color: #e2e8f0;
  --fc-button-text-color: #475569;
  --fc-button-hover-bg-color: #f8fafc;
  --fc-button-active-bg-color: #f1f5f9;
  --fc-today-bg-color: #f1f7ff;
}

:deep(.fc .fc-toolbar-title) {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.5px;
}

:deep(.fc-event) {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: none !important;
  margin-bottom: 2px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

:deep(.fc-daygrid-day-number) {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  padding: 8px !important;
}

:deep(.fc-col-header-cell-cushion) {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  padding: 12px 0 !important;
  text-decoration: none !important;
}
</style>
