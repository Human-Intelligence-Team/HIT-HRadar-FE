<template>
  <section class="department-attendance-calendar-view">
    <div class="view-header">
      <div class="title-group">
        <h1>부서별 근태 캘린더</h1>
      </div>
      <div class="header-actions">
        <div class="form-group">
          <label for="departmentSelect">부서 선택:</label>
          <select id="departmentSelect" v-model="selectedDepartmentId" class="select">
            <option value="">전체 부서</option>
            <option v-for="dept in departmentOptions" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
          </select>
        </div>
      </div>
    </div>
    <div class="calendar-container card">
      <div v-if="loading" class="calendar-loading">캘린더 데이터를 불러오는 중...</div>
      <FullCalendar v-else ref="fullCalendar" :options="calendarOptions" />
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
import { ref, watch, onMounted } from 'vue'; // Removed unused computed
import { useAuthStore } from '@/stores/authStore';
// Removed unused useRouter, computed
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { fetchAttendanceCalendar } from '@/api/attendanceApi';
import AttendanceDetailModal from '@/components/attendance/AttendanceDetailModal.vue';
import { getAllDepartmentsByCompany } from '@/api/departmentApi';

const auth = useAuthStore();
// Removed unused router, companyId

const departmentOptions = ref([]);
const selectedDepartmentId = ref(''); // ✅ Restored: Essential for dropdown binding
const fullCalendar = ref(null);
const calendarEvents = ref([]);
const loading = ref(false);
const isModalOpen = ref(false);
const selectedAttendance = ref(null);

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin, bootstrap5Plugin],
  initialView: 'dayGridMonth',
  events: calendarEvents,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth'
  },
  locale: 'ko',
  dayMaxEvents: true,
  eventDidMount: function(info) {
    if (info.event.extendedProps.type) {
      info.el.classList.add('event-' + info.event.extendedProps.type);
    }
  },
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
        const response = await getAllDepartmentsByCompany();
        if (response.data && response.data.success) {
            departmentOptions.value = response.data.data.departments.map(d => ({
                id: d.deptId,
                name: d.deptName
            }));
             if (departmentOptions.value.length > 0) {
                selectedDepartmentId.value = departmentOptions.value[0].id;
            }
        }
    } catch(e) {
        console.error("Failed to fetch departments:", e);
    }
}

const fetchCalendarEvents = async (startDate, endDate) => {
  if (!selectedDepartmentId.value) {
    calendarEvents.value = [];
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
    if (response.data) {
      console.log("API Response Data Sample:", response.data[0]); // Debugging
      response.data.forEach(record => {
        // console.log("Processing record:", record); // Optional: detailed log
        const date = record.workDate;
        const status = record.status || (record.totalWorkMinutes > 0 ? '퇴근' : '미출근');
        const title = `${record.empName}: ${status}`;

        events.push({
          id: `dept-${record.empId}-${date}`,
          title: title,
          date: date,
          allDay: true,
          extendedProps: {
            type: 'department-attendance',
            employeeId: record.empId,
            employeeName: record.empName,
            deptName: record.departmentName,
            status: status,
            workType: record.workType,
            workPlace: record.location
          }
        });
      });
    }
    calendarEvents.value = events;

  } catch (error) {
    console.error('부서 캘린더 이벤트를 불러오는 데 실패했습니다:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDepartments();
});

watch(selectedDepartmentId, () => {
  if (fullCalendar.value) {
    const calendarApi = fullCalendar.value.getApi();
    calendarApi.refetchEvents();
  }
});
</script>

<style scoped>
.department-attendance-calendar-view {
  padding: 16px;
}
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title-group h1 {
  font-size: 24px;
  font-weight: 700;
}
.title-group .sub {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.form-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-group label {
  font-size: 14px;
  color: #374151;
}
.select {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  cursor: pointer;
  min-width: 150px;
}
.calendar-container {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
}

.calendar-loading {
  text-align: center;
  padding: 50px;
  color: #9ca3af;
}

/* FullCalendar 기본 스타일 오버라이드 및 커스텀 */
.fc .fc-button-primary {
  background-color: #2563eb;
  border-color: #2563eb;
  color: #fff;
}

.fc .fc-button-primary:hover {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

.fc .fc-toolbar-title {
  font-size: 1.5em;
  font-weight: 600;
  color: #111827;
}

/* 이벤트별 스타일 */
.fc-event-main {
  font-size: 0.8em; /* 사원 이름이 길 수 있으므로 폰트 크기 조정 */
  padding: 2px 4px;
  white-space: normal; /* 여러 줄 표시 허용 */
}

.event-department-attendance {
  background-color: #e0e7ff; /* Light blue-gray */
  border-color: #6366f1; /* Indigo */
  color: #1e3a8a; /* Dark indigo text */
}

/* FullCalendar bootstrap5 theme variables - customize if needed */
/* :root {
  --fc-button-text-color: #fff;
  --fc-button-bg-color: #2563eb;
  --fc-button-border-color: #2563eb;
  --fc-button-hover-bg-color: #1d4ed8;
  --fc-button-hover-border-color: #1d4ed8;
  --fc-button-active-bg-color: #1e40af;
  --fc-button-active-border-color: #1e40af;
} */
/* 더보기 링크 스타일링 */
:deep(.fc-more-link) {
  background-color: #f2f4f6;
  color: #4e5968;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75em;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  margin-top: 2px;
}

:deep(.fc-more-link:hover) {
  background-color: #e5e8eb;
  color: #333d4b;
}

</style>
