<template>
  <section class="department-attendance-view">
    <div class="split-layout">
      <!-- Left Panel: Controls & Filters -->
      <div class="left-panel">
        <div class="control-card card">
          <div class="card-header">
            <h3>부서 캘린더</h3>
          </div>
          
          <div class="card-body">
            <!-- 1. Department Select -->
            <div class="control-group">
                <label class="group-label">부서 선택</label>
                <select v-model="selectedDepartmentId" class="select-full">
                    <option v-for="dept in departmentOptions" :key="dept.id" :value="dept.id">
                        {{ dept.name }}
                    </option>
                </select>
            </div>

            <!-- 2. Employee Select -->
            <div class="control-group">
                <label class="group-label">사원 선택</label>
                <select v-model="selectedEmployeeId" class="select-full">
                    <option value="">전체 사원</option>
                    <option v-for="emp in employeeOptions" :key="emp.id" :value="emp.id">
                        {{ emp.name }}
                    </option>
                </select>
            </div>

            <!-- 3. Work Type Filters -->
            <div class="control-group">
                <div class="group-header">
                    <label class="group-label">근무 유형</label>
                    <button class="btn-text" @click="toggleAllFilters">전체 선택</button>
                </div>
                <div class="filter-list">
                    <label v-for="type in workTypes" :key="type.key" class="filter-item">
                        <input 
                            type="checkbox" 
                            :value="type.key" 
                            v-model="selectedFilters"
                        >
                        <span class="custom-checkbox" :style="{ '--active-color': type.color }"></span>
                        <span class="filter-name">{{ type.label }}</span>
                    </label>
                </div>
            </div>

            <!-- 4. Search Button -->
            <button class="btn-search-primary" @click="handleSearch">
                조회
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel: Calendar -->
      <div class="right-panel">
        <div class="calendar-card card">
            <div class="calendar-wrapper">
               <div v-if="loading" class="calendar-loading-overlay">
                  <div class="spinner"></div>
                  <span>데이터 로딩 중...</span>
               </div>
               <FullCalendar ref="fullCalendar" :options="calendarOptions">
                 <template #eventContent="arg">
                   <div class="custom-event-content">
                     <div class="dot" :style="{ backgroundColor: getWorkTypeColor(arg.event.extendedProps.workType, arg.event.extendedProps.status) }"></div>
                     <div class="event-title">{{ arg.event.title }}</div>
                   </div>
                 </template>
               </FullCalendar>
            </div>
        </div>
      </div>
    </div>

    <!-- 근무 상세 정보 모달 -->
    <AttendanceDetailModal
      :is-open="isModalOpen"
      :attendance="selectedAttendance"
      @close="isModalOpen = false"
    />
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { fetchAttendanceCalendar } from '@/api/attendanceApi';
import AttendanceDetailModal from '@/components/attendance/AttendanceDetailModal.vue';
import { getAllDepartmentsByCompany, getDepartmentMembers } from '@/api/departmentApi';
import { getDepartmentLeaves } from '@/api/leaveApi';
import { connectSSE, disconnectSSE } from '@/api/notificationSse';

// const auth = useAuthStore(); // Unused top-level assignment

// Data
const departmentOptions = ref([]);
const selectedDepartmentId = ref('');
const rawEvents = ref([]); // Store raw API data
const loading = ref(false);
const isModalOpen = ref(false);
const selectedAttendance = ref(null);
const fullCalendar = ref(null);

// Filters
const selectedEmployeeId = ref(''); // New Dropdown selection
const selectedFilters = ref(['OFFICE', 'REMOTE', 'TRIP', 'FIELD', 'VACATION']);
const employeeOptions = ref([]);

const workTypes = [
    { key: 'OFFICE', label: '내근/출근', color: '#3b82f6' },
    { key: 'REMOTE', label: '재택', color: '#10b981' },
    { key: 'FIELD', label: '외근', color: '#f59e0b' },
    { key: 'TRIP', label: '출장', color: '#8b5cf6' },
    { key: 'VACATION', label: '휴가', color: '#ef4444' }
];

// Fetch employees when department changes
const fetchEmployees = async (deptId) => {
    if (!deptId) {
        employeeOptions.value = [];
        return;
    }
    
    try {
        const response = await getDepartmentMembers(deptId);
        if (response.data && response.data.success) {
            const memberList = response.data.data.employees || response.data.data || [];
            if (Array.isArray(memberList)) {
                employeeOptions.value = memberList.map(m => ({
                    id: m.empId || m.employeeId,
                    name: m.name
                })).sort((a, b) => a.name.localeCompare(b.name));
            } else {
                employeeOptions.value = [];
            }
        }
    } catch (error) {
        console.error("Failed to fetch department members:", error);
        employeeOptions.value = [];
    }
};

// Computed Events for Display
const filteredEvents = computed(() => {
    let result = rawEvents.value;

    // 1. Employee Dropdown Filter
    if (selectedEmployeeId.value) {
        result = result.filter(e => String(e.extendedProps.employeeId) === String(selectedEmployeeId.value));
    }

    // 2. Type Filter
    result = result.filter(e => {
        // Map raw data type to filter keys
        const typeStr = e.extendedProps.workType || '';
        let key = 'OFFICE'; // Default
        
        if (typeStr.includes('재택')) key = 'REMOTE';
        else if (typeStr.includes('외근')) key = 'FIELD';
        else if (typeStr.includes('출장')) key = 'TRIP';
        else if (typeStr.includes('휴가')) key = 'VACATION';
        else if (typeStr.includes('내근') || typeStr.includes('출근')) key = 'OFFICE';
        
        return selectedFilters.value.includes(key);
    });

    return result;
});
const getWorkTypeColor = (type, status) => {
  if (status === '퇴근') return '#94a3b8'; // Gray for Clocked out
  if (!type) return '#94a3b8'; // Default Gray
  if (type.includes('재택') || type === 'REMOTE') return '#10b981'; // Green
  if (type.includes('내근') || type.includes('출근') || type === 'WORK') return '#3b82f6'; // Blue
  if (type.includes('출장') || type === 'TRIP') return '#8b5cf6'; // Purple
  if (type.includes('휴가') || type === 'VACATION') return '#ef4444'; // Red
  if (type.includes('외근') || type === 'FIELD') return '#f59e0b'; // Orange
  return '#3b82f6'; // Default Blue
};

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin, bootstrap5Plugin],
  initialView: 'dayGridMonth',
  events: filteredEvents, // Bind filtered list
  headerToolbar: {
    left: 'title prev,next today',
    center: '',
    right: ''
  },
  locale: 'ko',
  dayMaxEvents: 5,
  eventDidMount: function() {
     // Optional: Add specific class based on exact match if needed
     // Styling is largely handled by event content or default styles
  },
  eventClick: (info) => {
    selectedAttendance.value = {
      ...info.event.extendedProps,
      workDate: info.event.startStr,
    };
    isModalOpen.value = true;
  },
  datesSet: async (dateInfo) => {
    // Only fetch if dept is selected. 
    // Wait for onMounted to set initial department if needed.
    if (selectedDepartmentId.value) {
       await fetchCalendarEvents(dateInfo.startStr.substring(0, 10), dateInfo.endStr.substring(0, 10));
    }
  }
});

const toggleAllFilters = () => {
    if (selectedFilters.value.length === workTypes.length) {
        selectedFilters.value = [];
    } else {
        selectedFilters.value = workTypes.map(t => t.key);
    }
};

const handleSearch = () => {
    if (fullCalendar.value) {
        const calendarApi = fullCalendar.value.getApi();
        // Triggering refetchEvents will cause datesSet to be called again if necessary,
        // or we can manually call fetchCalendarEvents with current view dates.
        const start = calendarApi.view.activeStart.toISOString().substring(0, 10);
        const end = calendarApi.view.activeEnd.toISOString().substring(0, 10);
        fetchCalendarEvents(start, end);
    }
};

const fetchDepartments = async () => {
    try {
        const response = await getAllDepartmentsByCompany();
        if (response.data && response.data.success) {
            departmentOptions.value = response.data.data.departments.map(d => ({
                id: d.deptId,
                name: d.deptName
            }));
            // Set default if empty
            if (!selectedDepartmentId.value && departmentOptions.value.length > 0) {
                 // Try to match user's dept logic? Or just first.
                 // Ideally user's dept is better.
                 // let's grab user store logic if available or just first
                 const auth = useAuthStore();
                 if (auth.user?.departmentId) {
                     const myDept = departmentOptions.value.find(d => String(d.id) === String(auth.user.departmentId));
                     selectedDepartmentId.value = myDept ? myDept.id : departmentOptions.value[0].id;
                 } else {
                     selectedDepartmentId.value = departmentOptions.value[0].id;
                 }
            }
        }
    } catch(e) {
        console.error("Failed to fetch departments:", e);
    }
}

const fetchCalendarEvents = async (startDate, endDate) => {
  if (!selectedDepartmentId.value) {
    rawEvents.value = [];
    return;
  }

  loading.value = true;
  try {
    const [attResponse, leaveResponse] = await Promise.all([
      fetchAttendanceCalendar({
        targetDeptId: selectedDepartmentId.value,
        fromDate: startDate,
        toDate: endDate
      }),
      getDepartmentLeaves()
    ]);

    let events = [];
    
    // 1. Process Attendance Data
    const attData = attResponse.data?.data || attResponse.data || [];
    if (Array.isArray(attData)) {
      attData.forEach(record => {
        const date = record.workDate;
        const status = record.status || (record.totalWorkMinutes > 0 ? '퇴근' : '미출근');
        
        let title = record.empName; 
        if (status === '퇴근') {
            title += ` (퇴근)`;
        } else if (status !== '미출근' && status !== '휴가') {
            const typeLabel = (record.workType === 'WORK' || !record.workType || record.workType === '내근') ? '내근' : mapWorkType(record.workType);
            title += ` (${typeLabel})`;
        }
        events.push({
          id: `dept-att-${record.empId}-${date}`,
          title: title,
          date: date,
          allDay: true,
          extendedProps: {
            type: 'attendance',
            employeeId: record.empId,
            employeeName: record.empName,
            deptName: record.departmentName,
            status: record.status || '-',
            workType: record.workType || '내근',
            workPlace: record.location,
            clockInTime: record.checkInTime,
            clockOutTime: record.checkOutTime
          }
        });
      });
    }

    // 2. Process Department Leave Data
    const leaveData = leaveResponse.data?.data || [];
    if (Array.isArray(leaveData)) {
      // Find current department name to fallback for filtering
      const currentDept = departmentOptions.value.find(d => String(d.id) === String(selectedDepartmentId.value));
      const currentDeptName = currentDept?.name;

      leaveData
        .filter(l => {
          const isApproved = l.approvalStatus === 'APPROVED';
          // Match by ID OR Name for robustness
          const isMyDept = String(l.departmentId) === String(selectedDepartmentId.value) || 
                           (currentDeptName && l.departmentName === currentDeptName);
          return isApproved && isMyDept;
        })
        .forEach(leave => {
          // Robust date iteration avoiding toISOString() timezone issues
          let current = new Date(leave.startDate);
          const end = new Date(leave.endDate);
          
          while (current <= end) {
            const y = current.getFullYear();
            const m = String(current.getMonth() + 1).padStart(2, '0');
            const d = String(current.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;
            
            if (dateStr >= startDate && dateStr <= endDate) {
                events.push({
                  id: `dept-leave-${leave.leaveId}-${dateStr}`,
                  title: `${leave.empName} (휴가)`,
                  date: dateStr,
                  allDay: true,
                  color: '#ef4444',
                  extendedProps: {
                    type: 'leave',
                    employeeId: leave.empId || leave.employeeId,
                    employeeName: leave.empName,
                    deptName: leave.departmentName,
                    status: '휴가',
                    workType: 'VACATION',
                    leaveType: leave.leaveType,
                    reason: leave.reason
                  }
                });
            }
            current.setDate(current.getDate() + 1);
          }
        });
    }

    rawEvents.value = events;

  } catch (error) {
    console.error('부서 캘린더 데이터를 불러오는 데 실패했습니다:', error);
  } finally {
    loading.value = false;
  }
};

// Real-time update via SSE
const onNotification = (data) => {
  if (data.type === 'ATTENDANCE_CHANGED') {
    console.log('Real-time attendance update received:', data);
    handleSearch(); // Refresh calendar data
  }
};

onMounted(() => {
  fetchDepartments();
  connectSSE(onNotification);
});

onUnmounted(() => {
  disconnectSSE(onNotification);
});

watch(selectedDepartmentId, (newId) => {
  if (newId) {
    // Reset selected employee when dept changes
    selectedEmployeeId.value = '';
    fetchEmployees(newId);
    
    if (fullCalendar.value) {
      const calendarApi = fullCalendar.value.getApi();
      calendarApi.refetchEvents(); 
    }
  } else {
    employeeOptions.value = [];
  }
});

const mapWorkType = (type) => {
    if (!type || type === '-' || type === 'WORK') return '내근';
    const mapper = {
        'WORK': '내근',
        'REMOTE': '재택',
        'FIELD': '외근',
        'TRIP': '출장',
        'VACATION': '휴가'
    };
    return mapper[type] || type;
};
</script>

<style scoped>
.department-attendance-view {
  --active-color: #3b82f6; /* Default fallback */
  padding: 24px;
  background-color: #f1f5f9;
  height: 100%;
}

.split-layout {
    display: flex;
    gap: 24px;
    height: 100%;
}

.left-panel {
    flex: 0 0 300px;
}

.right-panel {
    flex: 1;
    min-width: 0;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.control-card .card-header {
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;
}
.control-card .card-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
}

.control-card .card-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.group-label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #334155; /* Darker from #64748b */
    margin-bottom: 8px;
}

.select-full {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    background-color: #fff;
    color: #1e293b; /* Explicit dark color */
}
.select-full:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.btn-text {
    background: none;
    border: none;
    font-size: 12px;
    color: #3b82f6;
    cursor: pointer;
    padding: 0;
}

.filter-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.filter-item {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #334155;
    padding: 6px 0;
}

/* Custom Checkbox */
.filter-item input { position: absolute; opacity: 0; height: 0; width: 0; }
.custom-checkbox {
    width: 18px;
    height: 18px;
    border: 2px solid #cbd5e1;
    border-radius: 4px;
    position: relative;
    transition: all 0.2s;
}

.filter-item input:checked ~ .custom-checkbox {
    background-color: var(--active-color, #3b82f6);
    border-color: var(--active-color, #3b82f6);
}
.filter-item input:checked ~ .custom-checkbox:after {
    content: "";
    position: absolute;
    left: 5px;
    top: 1px;
    width: 4px;
    height: 9px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.btn-search-primary {
    width: 100%;
    padding: 12px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: auto; /* Push to bottom if flex container allows */
}
.btn-search-primary:hover {
    background-color: #2563eb;
}

/* Calendar Card */
.calendar-card {
    border: 1px solid #e2e8f0;
}
.calendar-wrapper {
    padding: 20px;
    height: 100%;
    position: relative;
    overflow-y: auto;
}

.calendar-loading-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(255,255,255,0.8);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #64748b;
}

.spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
}
@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }


/* FullCalendar Customization (Retained) */
:deep(.fc-header-toolbar) {
    margin-bottom: 24px !important;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
}

:deep(.fc-toolbar-title) {
    color: #1e293b !important;
    font-weight: 800 !important;
}

:deep(.fc-button-active) {
  background-color: #e2e8f0 !important;
  color: #1e293b !important;
}

:deep(.fc-daygrid-day-number) {
  color: #1e293b; /* Darker from #64748b */
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

:deep(.fc-col-header-cell-cushion) {
  color: #334155;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  opacity: 1;
}

:deep(.fc-event) {
  border: none;
  border-radius: 4px;
  font-size: 11px;
  margin-bottom: 2px;
  cursor: pointer;
  background-color: transparent !important;
  padding: 0;
}

:deep(.fc-daygrid-event-harness) {
    margin-bottom: 2px;
}

:deep(.fc-daygrid-event-dot) {
    display: none;
}

.custom-event-content {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.custom-event-content:hover {
    background-color: #f1f5f9;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.event-title {
    font-size: 11px;
    font-weight: 800;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
