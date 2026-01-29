<template>
  <section class="attendance-employee-detail-view">
    <div class="view-header">
      <div class="title-group">
        <h1>사원 근태 상세 조회</h1>
        <div class="sub">{{ employeeId }} 님의 {{ workDate }} 근태 상세 정보</div>
      </div>
    </div>
    <div class="detail-container card">
      <!-- 상세 정보가 여기에 표시됩니다. -->
      <p>로딩 중...</p>
      <p>직원 ID: {{ employeeId }}</p>
      <p>조회 날짜: {{ workDate }}</p>
    </div>
  </section>
</template>

<script setup>
import { defineProps, ref, onMounted } from 'vue';
// import { fetchAttendanceDetail } from '@/api/attendanceApi'; // 상세 조회 API (필요시 추가)

const props = defineProps({
  employeeId: {
    type: String,
    required: true
  },
  workDate: {
    type: String,
    required: true
  }
});

const attendanceDetail = ref(null);
const loading = ref(false);

onMounted(async () => {
  // 실제 API 호출 로직
  // loading.value = true;
  // try {
  //   const response = await fetchAttendanceDetail(props.employeeId, props.workDate);
  //   attendanceDetail.value = response.data;
  // } catch (error) {
  //   console.error('근태 상세 정보를 불러오는 데 실패했습니다:', error);
  // } finally {
  //   loading.value = false;
  // }
});
</script>

<style scoped>
.attendance-employee-detail-view {
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
.detail-container {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
}
</style>
