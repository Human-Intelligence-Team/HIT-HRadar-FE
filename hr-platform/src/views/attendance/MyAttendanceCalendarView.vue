<template>
  <section class="my-attendance-calendar-view">
    <div class="view-header">
      <div class="title-group">
        <h1>나의 근태 캘린더</h1>
        <div class="sub">월별 근무 및 휴가 현황을 확인합니다.</div>
      </div>
    </div>
    <div class="calendar-container card">
      <div v-if="loading" class="calendar-loading">캘린더 데이터를 불러오는 중...</div>
      <FullCalendar v-else :options="calendarOptions" />
    </div>
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
import { fetchMyLeaves } from '@/api/leaveApi';

const auth = useAuthStore();
const employeeId = computed(() => auth.user?.employeeId);

const calendarEvents = ref([]);
const loading = ref(false);

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
    if (employeeId.value) {
      const start = new Date(dateInfo.start);
      const end = new Date(dateInfo.end);
      // FullCalendar의 end는 다음 달 1일이므로, 실제 마지막 날짜는 전날
      end.setDate(end.getDate() - 1); // 캘린더 라이브러리에서 제공하는 end는 다음 달의 시작일이므로, 실제 마지막 날을 계산

      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = end.toISOString().split('T')[0];

      await fetchCalendarEvents(startDateStr, endDateStr);
    }
  }
});

const fetchCalendarEvents = async (startDate, endDate) => {
  await fetchAttendanceCalendar({
    targetEmpId: employeeId.value,
    fromDate: startDate,
    toDate: endDate
  });
  console.log('Fetching calendar events for range:', startDate, 'to', endDate);
  loading.value = true;
  try {
    const attendanceResponse = await fetchAttendanceCalendar (employeeId.value, false, startDate, endDate);
    const leaveResponse = await fetchMyLeaves(); // 휴가 API는 기간 필터링이 없을 수 있으므로 클라이언트에서 필터링

    console.log('Attendance Response:', attendanceResponse.data);
    console.log('Leave Response:', leaveResponse.data);

    let events = [];

    // 근태 데이터 처리
    if (attendanceResponse.data) {
      attendanceResponse.data.forEach(record => {
        const date = record.workDate;
        const title = `${record.workPlace || '미지정'} - ${record.workType || '미지정'}`;
        events.push({
          id: `att-${record.id}`,
          title: title,
          date: date,
          allDay: true,
          extendedProps: {
            type: 'attendance',
            workType: record.workType,
            workPlace: record.workPlace
          }
        });
      });
    }

    // 휴가 데이터 처리 (클라이언트 측에서 기간 필터링 적용)
    if (leaveResponse.data && Array.isArray(leaveResponse.data)) {
      leaveResponse.data.forEach(leave => {
        const leaveStart = leave.fromDate;
        const leaveEnd = leave.toDate;

        // 휴가 기록이 현재 캘린더 범위 내에 있는지 확인
        if (
          leaveStart && leaveEnd &&
          new Date(leaveStart) <= new Date(endDate) &&
          new Date(leaveEnd) >= new Date(startDate)
        ) {
          const endDateForFullCalendar = new Date(leaveEnd);
          endDateForFullCalendar.setDate(endDateForFullCalendar.getDate() + 1);

          events.push({
            id: `leave-${leave.id}`,
            title: `휴가 (${leave.leaveTypeName || '미지정'})`,
            start: leaveStart,
            end: endDateForFullCalendar.toISOString().split('T')[0],
            allDay: true,
            extendedProps: {
              type: 'leave',
              leaveType: leave.leaveTypeName
            }
          });
        }
      });
    }
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
  if (employeeId.value) {
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
