<template>
  <section class="my-attendance-calendar-view">
    <div class="view-header">
      <div class="title-group">
        <h1>나의 근태 캘린더</h1>
      </div>
    </div>
    <div class="calendar-container card">
      <!-- v-if 대신 오버레이 표시로 변경하여 캘린더 언마운트와 그로 인한 무한 루프 방지 -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <span>데이터를 불러오는 중...</span>
      </div>
      <FullCalendar :key="calendarKey" ref="fullCalendar" :options="calendarOptions" />
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
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { fetchAttendanceCalendar } from '@/api/attendanceApi';
import AttendanceDetailModal from '@/components/attendance/AttendanceDetailModal.vue';

const auth = useAuthStore();
const employeeId = computed(() => auth.user?.employeeId);
const departmentId = computed(() => auth.user?.departmentId); // authStore.js의 변수명과 일치하도록 수정

const calendarEvents = ref([]);
const loading = ref(false);
const fullCalendar = ref(null);
const calendarKey = computed(() => `${employeeId.value}-${departmentId.value}`); // ID가 바뀌면 캘린더 전체를 다시 그리도록 강제

// 모달 관련 상태
const isModalOpen = ref(false);
const selectedAttendance = ref(null);

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin, bootstrap5Plugin],
  initialView: 'dayGridMonth',
  events: async (info, successCallback, failureCallback) => {
    if (!employeeId.value || !departmentId.value) {
      successCallback([]);
      return;
    }
    try {
      const start = info.startStr.split('T')[0];
      const end = new Date(info.end);
      end.setDate(end.getDate() - 1);
      const endDateStr = end.toISOString().split('T')[0];
      
      const events = await fetchCalendarEvents(start, endDateStr);
      successCallback(events);
    } catch (error) {
      failureCallback(error);
    }
  },
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
  }
});

const fetchCalendarEvents = async (startDate, endDate) => {
  console.log('Fetching calendar events for range:', startDate, 'to', endDate);
  loading.value = true;
  try {
    // Fetch attendance for the current user
    const params = {
      targetEmpId: Number(employeeId.value), // 확실한 숫자 변환
      fromDate: startDate,
      toDate: endDate
    };
    console.log('Sending request with params:', params);

    const attendanceResponse = await fetchAttendanceCalendar(params);
    // TODO: Need a backend API to fetch leaves for the entire department or all employees
    // For now, only fetching current user's leaves will not achieve the 'department members' leave status goal.
    // const leaveResponse = await fetchMyLeaves();

    console.log('Attendance API Response Data:', attendanceResponse.data);
    if (!attendanceResponse.data || attendanceResponse.data.length === 0) {
      console.warn('API returned empty results for employeeId:', employeeId.value);
    }

    let events = [];

    // 근태 데이터 처리
    if (attendanceResponse.data) {
      attendanceResponse.data.forEach(record => {
        const date = record.workDate;
         // 상태 표시: 출근 여부에 따른 기본 상태 설정
        // DTO status has priority, otherwise calculate
        const status = record.status || (record.totalWorkMinutes > 0 ? '퇴근' : '미출근');
        const title = `${record.empName}: ${status}`;

        events.push({
          id: `att-${record.empId}-${date}`,
          title: title,
          date: date,
          allDay: true,
          extendedProps: {
            type: 'attendance',
            employeeId: record.empId,
            employeeName: record.empName,
            deptName: record.departmentName || '-',
            status: status,
            workType: record.workType,
            workPlace: record.location
          }
        });
      });
    }

    // TODO: 휴가 데이터 처리 - 현재 fetchMyLeaves는 단일 사용자용. 부서원 전체 휴가 API 필요.
    // if (leaveResponse.data && Array.isArray(leaveResponse.data)) {
    //   leaveResponse.data.forEach(leave => {
    //     const leaveStart = leave.fromDate;
    //     const leaveEnd = leave.toDate;
    //
    //     if (
    //       leaveStart && leaveEnd &&
    //       new Date(leaveStart) <= new Date(endDate) &&
    //       new Date(leaveEnd) >= new Date(startDate)
    //     ) {
    //       const endDateForFullCalendar = new Date(leaveEnd);
    //       endDateForFullCalendar.setDate(endDateForFullCalendar.getDate() + 1);
    //
    //       events.push({
    //         id: `leave-${leave.id}`,
    //         title: `휴가 (${leave.leaveTypeName || '미지정'})`,
    //         start: leaveStart,
    //         end: endDateForFullCalendar.toISOString().split('T')[0],
    //         allDay: true,
    //         extendedProps: {
    //           type: 'leave',
    //           employeeId: leave.employeeId, // Assuming employeeId is part of leave response
    //           leaveType: leave.leaveTypeName
    //         }
    //       });
    //     }
    //   });
    // }
    // dummy data for debugging removed
    
    // calendarEvents.value = events; // 더 이상 ref를 직접 갈아끼우지 않고 반환합니다.
    return events;

  } catch (error) {
    console.error('캘린더 이벤트를 불러오는 데 실패했습니다:', error);
    return [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // FullCalendar가 events 함수를 통해 직접 관리하므로 수동 호출이 필요 없습니다.
});
</script>

<style scoped>
.my-attendance-calendar-view {
  padding: 16px;
}
.view-header {
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
.calendar-container {
  position: relative; /* 로딩 오버레이 기준점 */
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  min-height: 400px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 14px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  font-size: 0.85em;
  padding: 2px 4px;
}

.event-attendance {
  background-color: #d1fae5; /* Light green */
  border-color: #34d399; /* Green */
  color: #065f46; /* Dark green text */
}

.event-leave {
  background-color: #bfdbfe; /* Light blue */
  border-color: #60a5fa; /* Blue */
  color: #1e40af; /* Dark blue text */
}

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
</style>
