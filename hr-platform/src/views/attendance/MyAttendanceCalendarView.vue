<template>
  <section class="my-attendance-calendar-view">
    <div class="view-header">
      <div class="title-group">
        <h1>나의 근태 캘린더</h1>
      </div>
    </div>
    <div class="calendar-container card">
      <div v-if="loading" class="calendar-loading">캘린더 데이터를 불러오는 중...</div>
      <FullCalendar v-else :options="calendarOptions" />
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
const departmentId = computed(() => auth.user?.deptId); // Assuming deptId is available in auth.user

const calendarEvents = ref([]);
const loading = ref(false);

// 모달 관련 상태
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
  locale: 'ko', // 한국어 설정
  dayMaxEvents: true, // +more 링크 표시
  eventDidMount: function(info) {
    if (info.event.extendedProps.type) {
      info.el.classList.add('event-' + info.event.extendedProps.type);
    }
  },
  datesSet: async (dateInfo) => {
    // 캘린더 날짜 범위가 변경될 때마다 이벤트 다시 로드
    if (employeeId.value && departmentId.value) { // Ensure both are available
      const start = new Date(dateInfo.start);
      const end = new Date(dateInfo.end);
      end.setDate(end.getDate() - 1);

      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = end.toISOString().split('T')[0];

      await fetchCalendarEvents(startDateStr, endDateStr);
    }
  },
  eventClick: (info) => {
    // 모달 표시
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
    // Fetch attendance for the entire department
    const attendanceResponse = await fetchAttendanceCalendar(departmentId.value, true, startDate, endDate);
    // TODO: Need a backend API to fetch leaves for the entire department or all employees
    // For now, only fetching current user's leaves will not achieve the 'department members' leave status goal.
    // const leaveResponse = await fetchMyLeaves();

    console.log('Department Attendance Response:', attendanceResponse.data);

    let events = [];

    // 근태 데이터 처리
    if (attendanceResponse.data) {
      attendanceResponse.data.forEach(deptRecord => {
        deptRecord.attendanceRecords.forEach(record => {
          const date = record.workDate;
          // 상태 표시: 출근 여부에 따른 기본 상태 설정
          const status = record.status || (record.checkInTime ? '출근중' : '결근');
          const title = `${deptRecord.employeeName}: ${status}`;
          
          events.push({
            id: `att-${deptRecord.employeeId}-${date}`,
            title: title,
            date: date,
            allDay: true,
            extendedProps: {
              type: 'attendance',
              employeeId: deptRecord.employeeId,
              employeeName: deptRecord.employeeName,
              deptName: deptRecord.deptName,
              status: status,
              workType: record.workType,
              workPlace: record.workPlace
            }
          });
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
    calendarEvents.value = events;
    console.log('Final events for calendar:', calendarEvents.value);

  } catch (error) {
    console.error('캘린더 이벤트를 불러오는 데 실패했습니다:', error);
    // alert('캘린더 데이터를 불러오는 중 오류가 발생했습니다.'); // 사용자 요청에 따라 alert 제거
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // 컴포넌트 마운트 시 현재 월의 범위로 초기 데이터 로드
  if (employeeId.value && departmentId.value) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // 다음 달 0일 = 이번 달 마지막 날

    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = endOfMonth.toISOString().split('T')[0];

    fetchCalendarEvents(startDateStr, endDateStr)
  }
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
