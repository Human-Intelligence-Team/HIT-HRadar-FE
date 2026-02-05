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
               <FullCalendar ref="fullCalendar" :options="calendarOptions" />
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
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { fetchAttendanceCalendar } from '@/api/attendanceApi';
import AttendanceDetailModal from '@/components/attendance/AttendanceDetailModal.vue';
import { getAllDepartmentsByCompany } from '@/api/departmentApi';

const auth = useAuthStore();

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

const workTypes = [
    { key: 'OFFICE', label: '내근/출근', color: '#3b82f6' },
    { key: 'REMOTE', label: '재택', color: '#10b981' },
    { key: 'FIELD', label: '외근', color: '#f59e0b' },
    { key: 'TRIP', label: '출장', color: '#8b5cf6' },
    { key: 'VACATION', label: '휴가', color: '#ef4444' }
];

// Computed: Unique Employees from raw data
const employeeOptions = computed(() => {
    const map = new Map();
    rawEvents.value.forEach(e => {
        const props = e.extendedProps;
        if (props.employeeId && props.employeeName) {
            if (!map.has(props.employeeId)) {
                map.set(props.employeeId, props.employeeName);
            }
        }
    });
    
    // Convert to array and Sort by name
    return Array.from(map.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
});

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

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin, bootstrap5Plugin],
  initialView: 'dayGridMonth',
  events: filteredEvents, // Bind filtered list
  headerToolbar: {
    left: 'title prev,next today',
    center: '',
    right: 'dayGridMonth'
  },
  locale: 'ko',
  dayMaxEvents: true,
  eventDidMount: function() {
     // Optional: Add specific class based on exact match if needed
     // Styling is largely handled by event content or default styles
  },
  eventContent: function(arg) {
      // Custom event dot color
      const type = arg.event.extendedProps.workType;
      let color = '#3b82f6';
      if (type?.includes('재택')) color = '#10b981';
      if (type?.includes('외근')) color = '#f59e0b';
      if (type?.includes('출장')) color = '#8b5cf6';
      if (type?.includes('휴가')) color = '#ef4444';
      
      const dotStyle = `
        display: inline-block; 
        width: 8px; 
        height: 8px; 
        border-radius: 50%; 
        background-color: ${color}; 
        margin-right: 4px;
      `;
      
      return { html: `<div style="display: flex; align-items: center; overflow: hidden;"><span style="${dotStyle}"></span><span style="font-weight: 600; color: #374151; font-size: 11px;">${arg.event.title}</span></div>` };
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
    const response = await fetchAttendanceCalendar({
        targetDeptId: selectedDepartmentId.value,
        fromDate: startDate,
        toDate: endDate
      });

    let events = [];
    const data = response.data?.data || response.data || [];
    
    if (Array.isArray(data)) {
      data.forEach(record => {
        const date = record.workDate;
        // Simple title: Name
        let title = record.empName; 
        
        events.push({
          id: `dept-${record.empId}-${date}`,
          title: title,
          date: date,
          allDay: true,
          extendedProps: {
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
    rawEvents.value = events;

  } catch (error) {
    console.error('부서 캘린더 이벤트를 불러오는 데 실패했습니다:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDepartments();
});

watch(selectedDepartmentId, (newId) => {
  if (fullCalendar.value && newId) {
    const calendarApi = fullCalendar.value.getApi();
    // refetchEvents triggers datesSet, which calls our fetch logic
    calendarApi.refetchEvents(); 
  }
});
</script>

<style scoped>
.department-attendance-view {
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
    font-weight: 600;
    color: #64748b;
    margin-bottom: 8px;
}

.select-full, .input-full {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    background-color: #fff;
}
.select-full:focus, .input-full:focus {
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
    background-color: var(--active-color);
    border-color: var(--active-color);
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

:deep(.fc-toolbar-chunk:first-child) {
    display: flex;
    align-items: center;
    gap: 12px;
}

:deep(.fc-toolbar-title) {
  font-size: 20px !important;
  font-weight: 700 !important;
  color: #1e293b;
  margin-left: 4px;
}

:deep(.fc-button) {
    border-radius: 6px !important;
    padding: 6px 12px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    box-shadow: none !important;
    transition: all 0.2s;
}

:deep(.fc-prev-button),
:deep(.fc-next-button) {
    background-color: #f8fafc !important; 
    border: 1px solid #e2e8f0 !important; 
    color: #334155 !important; 
}

:deep(.fc-prev-button:hover),
:deep(.fc-next-button:hover) {
    background-color: #f1f5f9 !important;
    border-color: #cbd5e1 !important;
    color: #0f172a !important;
}

:deep(.fc-today-button) {
    background-color: #64748b !important; 
    border: 1px solid #64748b !important;
    color: #ffffff !important;
    opacity: 1 !important;
}

:deep(.fc-today-button:hover) {
    background-color: #475569 !important; 
    border-color: #475569 !important;
}
</style>
