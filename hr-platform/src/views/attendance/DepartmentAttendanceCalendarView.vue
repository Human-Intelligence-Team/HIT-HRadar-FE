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
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
          </select>
        </div>
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
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { fetchAttendanceCalendar } from '@/api/attendanceApi';
import AttendanceDetailModal from '@/components/attendance/AttendanceDetailModal.vue';

const auth = useAuthStore();
const router = useRouter();
const companyId = computed(() => auth.user?.companyId);

const departments = ref([
  { id: 1, name: '개발팀' },
  { id: 2, name: '인사팀' },
  { id: 3, name: '영업팀' },
]); // TODO: 실제 API 호출로 대체
const selectedDepartmentId = ref(''); // 기본값: 전체 부서

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
  eventClick: (info) => {
    // 모달 표시
    selectedAttendance.value = {
      ...info.event.extendedProps,
      workDate: info.event.startStr,
    };
    isModalOpen.value = true;
  },
  datesSet: async (dateInfo) => {
    if (companyId.value) {
      await fetchCalendarEvents(dateInfo.startStr.substring(0, 10), dateInfo.endStr.substring(0, 10));
    }
  }
});

const fetchDepartments = async () => {
  // 실제 API 호출 로직
  // try {
  //   const response = await fetchDepartments(companyId.value);
  //   departments.value = response.data;
  // } catch (error) {
  //   console.error('부서 목록을 불러오는 데 실패했습니다:', error);
  // }
};

const fetchCalendarEvents = async (startDate, endDate) => {
  if (!selectedDepartmentId.value) {
    calendarEvents.value = [];
    return;
  }

  await fetchAttendanceCalendar({
    targetDeptId: selectedDepartmentId.value,
    fromDate: startDate,
    toDate: endDate
  });
  loading.value = true;
  try {
    let response;
    if (selectedDepartmentId.value) {
      // 특정 부서 조회
      response = await fetchAttendanceCalendar (selectedDepartmentId.value, true, startDate, endDate);
    } else {
      // 전체 부서 조회 (백엔드에서 전체 부서 조회를 지원한다고 가정하거나, 모든 부서를 개별적으로 조회 후 병합)
      // 현재 백엔드 API는 targetDeptId가 필수. 따라서 전체 부서 조회를 하려면
      // 각 부서별로 호출하거나 백엔드 API에 전체 부서 조회 파라미터가 있어야 함.
      // 일단은 selectedDepartmentId가 없으면 빈 배열 반환으로 처리 (임시)
      calendarEvents.value = [];
      loading.value = false;
      return;
    }

    let events = [];
    if (response.data) {
      response.data.forEach(deptRecord => {
        deptRecord.attendanceRecords.forEach(record => {
          const date = record.workDate;
          const status = record.status || (record.checkInTime ? '출근중' : '결근');
          const title = `${deptRecord.employeeName}: ${status}`;
          
          events.push({
            id: `dept-${deptRecord.employeeId}-${date}`,
            title: title,
            date: date,
            allDay: true,
            extendedProps: {
              type: 'department-attendance',
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
    calendarEvents.value = events;

  } catch (error) {
    console.error('부서 캘린더 이벤트를 불러오는 데 실패했습니다:', error);
    alert('부서 캘린더 데이터를 불러오는 중 오류가 발생했습니다.');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDepartments();
});

watch(selectedDepartmentId, () => {
  // 부서 선택이 변경되면 캘린더 이벤트를 다시 로드
  const calendarApi = calendarOptions.value.getApi(); // FullCalendar API 인스턴스 가져오기
  if (calendarApi) {
    calendarApi.refetchEvents(); // events source를 다시 로드하도록 요청
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
</style>
