<template>
  <div class="calendar-page">
    <div class="header">
      <div class="title-section">
        <h1 class="title">부서 근태 현황 캘린더</h1>
        <p class="subtitle">부서원들의 휴가 및 근무 상태를 한눈에 파악할 수 있습니다.</p>
      </div>
    </div>

    <!-- 필터 및 컨트롤 섹션 -->
    <div class="control-card card">
      <div class="filter-layout">
        <div class="filter-item">
          <label>부서 선택</label>
          <select v-model="selectedDepartmentId" class="select-field">
            <option v-for="dept in departmentOptions" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label>사원 필터</label>
          <select v-model="selectedEmployeeId" class="select-field" :disabled="!selectedDepartmentId">
            <option value="">전체 사원</option>
            <option v-for="emp in employeeOptions" :key="emp.id" :value="emp.id">
              {{ emp.name }}
            </option>
          </select>
        </div>

        <div class="filter-item stretch">
          <label>근무 유형 필터</label>
          <div class="checkbox-group">
            <label v-for="type in workTypes" :key="type.key" class="check-item">
              <input type="checkbox" :value="type.key" v-model="selectedFilters" />
              <span class="check-label">{{ type.label }}</span>
            </label>
            <button class="btn-all" @click="toggleAllFilters">
              {{ selectedFilters.length === workTypes.length ? '전체 해제' : '전체 선택' }}
            </button>
          </div>
        </div>

        <div class="filter-actions">
           <button class="btn-refresh" @click="refreshCalendar">
             <i class="icon-refresh"></i> 새로고침
           </button>
        </div>
      </div>
    </div>

    <div class="calendar-container card">
        <FullCalendar ref="fullCalendar" :options="calendarOptions" />
    </div>

    <!-- Dummy usage to satisfy linter for dynamic CSS classes -->
    <div v-show="false" class="fc">
      <div class="fc-toolbar-title"></div>
      <div class="fc-event"></div>
    </div>

    <!-- 범례 섹션 -->
    <div class="legend-card">
      <div v-for="type in workTypes" :key="type.key" class="legend-item">
        <span class="dot" :style="{ backgroundColor: type.color }"></span>
        <span class="label">{{ type.label }}</span>
      </div>
    </div>

    <!-- Attendance Detail Modal -->
    <AttendanceDetailModal
      :is-open="isModalOpen"
      :attendance-detail="selectedAttendance"
      @close="isModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import AttendanceDetailModal from '@/components/attendance/AttendanceDetailModal.vue';
import { useAuthStore } from '@/stores/authStore';
import { getAllDepartmentsByCompany, getDepartmentMembers } from '@/api/departmentApi';
import { fetchAttendanceCalendar } from '@/api/attendanceApi';
import { getDepartmentLeaves } from '@/api/leaveApi';

const auth = useAuthStore();

const fullCalendar = ref(null);
const isModalOpen = ref(false);
const selectedAttendance = ref(null);

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

// 캘린더 옵션 - ref로 관리하되 변경 시 업데이트
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
    const res = await getAllDepartmentsByCompany(auth.user?.companyId);
    const rawData = res.data?.data?.departments || res.data?.data || [];
    
    // Recursive function to flatten the department tree
    const flattenDepts = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) {
        let result = [];
        data.forEach(item => {
          result.push(item);
          if (item.children && Array.isArray(item.children)) {
            result = result.concat(flattenDepts(item.children));
          }
        });
        return result;
      }
      return [data];
    };

    const flatList = flattenDepts(rawData);
    
    departmentOptions.value = flatList.map(d => ({
      id: d.deptId || d.id || d.departmentId,
      name: d.deptName || d.name || d.departmentName
    })).filter(d => d.id);

    if (!selectedDepartmentId.value && departmentOptions.value.length > 0) {
      selectedDepartmentId.value = auth.user?.departmentId || departmentOptions.value[0].id;
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
            const data = response.data.data;
            // Handle both flat array and nested object { employees: [...] }
            const memberList = Array.isArray(data) ? data : (data?.employees || []);
            
            if (Array.isArray(memberList)) {
                employeeOptions.value = memberList.map(m => ({
                    id: m.empId || m.employeeId,
                    name: m.name || m.userName || 'Unknown'
                })).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            } else {
                employeeOptions.value = [];
            }
        }
    } catch (error) {
        console.error("Failed to fetch department members:", error);
        employeeOptions.value = [];
    }
};

const fetchCalendarEvents = async (startDate, endDate) => {
    if (!selectedDepartmentId.value) return;

    try {
      const [attResponse, leaveResponse] = await Promise.all([
        fetchAttendanceCalendar({
          targetDeptId: selectedDepartmentId.value,
          fromDate: startDate,
          toDate: endDate
        }),
        getDepartmentLeaves()
      ]);

      const events = [];
      const attData = attResponse.data?.data || attResponse.data || [];
      const leaveData = leaveResponse.data?.data || leaveResponse.data || [];

      // Selected Department for client-side filtering of leaves
      const selectedDept = departmentOptions.value.find(d => d.id === selectedDepartmentId.value);

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
              workType: r.workType || 'OFFICE',
              status: r.status,
              checkIn: r.checkInTime,
              checkOut: r.checkOutTime
            }
          });
        });
      }

      if (Array.isArray(leaveData)) {
        leaveData.forEach(l => {
          // Filter by department if possible (via departmentName match if deptId not in DTO)
          if (selectedDept && l.departmentName && l.departmentName !== selectedDept.name) {
              return;
          }
          
          events.push({
            id: `leave-${l.leaveId}`,
            title: `[휴가] ${l.empName}`,
            start: l.startDate,
            end: l.endDate,
            allDay: true,
            backgroundColor: '#ef4444', 
            borderColor: '#ef4444',
            extendedProps: {
              employeeId: l.empId,
              employeeName: l.empName,
              workType: 'VACATION',
              status: '휴가'
            }
          });
        });
      }

      rawEvents.value = events;
      updateFilteredEvents();
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    }
};

const updateFilteredEvents = () => {
    let result = rawEvents.value;

    // 1. Employee Dropdown Filter
    if (selectedEmployeeId.value) {
        result = result.filter(e => String(e.extendedProps.employeeId) === String(selectedEmployeeId.value));
    }

    // 2. Type Filter
    result = result.filter(e => {
        const typeStr = String(e.extendedProps.workType || '').toUpperCase();
        let key = 'OFFICE';
        
        if (typeStr.includes('재택') || typeStr.includes('REMOTE')) key = 'REMOTE';
        else if (typeStr.includes('외근') || typeStr.includes('FIELD')) key = 'FIELD';
        else if (typeStr.includes('출장') || typeStr.includes('TRIP')) key = 'TRIP';
        else if (typeStr.includes('휴가') || typeStr.includes('VACATION')) key = 'VACATION';
        else if (typeStr.includes('내근') || typeStr.includes('출근') || typeStr.includes('WORK')) key = 'OFFICE';
        
        return selectedFilters.value.includes(key);
    });

    calendarOptions.value.events = result;
};

// Re-fetch when department changes
watch(selectedDepartmentId, async (newVal) => {
    if (newVal) {
        await fetchEmployees(newVal);
        selectedEmployeeId.value = '';
        refreshCalendar();
    }
});

// Filter dynamically
watch([selectedEmployeeId, selectedFilters], () => {
    updateFilteredEvents();
}, { deep: true });

const refreshCalendar = () => {
    if (fullCalendar.value) {
        const calendarApi = fullCalendar.value.getApi();
        // This will trigger datesSet, which in turn calls fetchCalendarEvents
        calendarApi.refetchEvents();
    }
};

const getEventColor = (workType) => {
  const type = String(workType || '').toUpperCase();
  if (type.includes('재택') || type.includes('REMOTE')) return '#8b5cf6';
  if (type.includes('외근') || type.includes('FIELD')) return '#10b981';
  if (type.includes('출장') || type.includes('TRIP')) return '#f59e0b';
  if (type.includes('휴가') || type.includes('VACATION')) return '#ef4444';
  return '#3b82f6'; // Default Blue
};

const toggleAllFilters = () => {
    if (selectedFilters.value.length === workTypes.length) {
        selectedFilters.value = [];
    } else {
        selectedFilters.value = workTypes.map(t => t.key);
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
.calendar-page {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header {
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

.filter-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}

.filter-item.stretch {
  flex: 1;
  min-width: 300px;
}

.filter-item label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.select-field {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  color: #1e293b;
  background-color: #fff;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.check-label {
  font-size: 13px;
  color: #334155;
}

.btn-all {
  font-size: 12px;
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
}

.btn-refresh {
  padding: 10px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.btn-refresh:hover {
  background-color: #2563eb;
}

.calendar-container {
  padding: 30px;
}

:deep(.fc) {
  --fc-border-color: #e2e8f0;
  --fc-button-bg-color: #ffffff;
  --fc-button-border-color: #e2e8f0;
  --fc-button-text-color: #1e293b;
  --fc-button-hover-bg-color: #f1f5f9;
  --fc-button-active-bg-color: #e2e8f0;
  --fc-today-bg-color: #f1f7ff;
}

:deep(.fc .fc-toolbar-title) {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

:deep(.fc-event) {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.75rem;
  border: none;
}

.legend-card {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: -8px;
  padding-bottom: 40px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

/* Modal and Icons stub */
.icon-refresh::before { content: "↺"; }
</style>
