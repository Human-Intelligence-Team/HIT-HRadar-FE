<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import CompetencyReportCreateModal from '@/views/report/CompetencyReportCreateModal.vue'

const isCreateModalOpen = ref(false);
const router = useRouter();
const isModalOpen = () => {
 // router.push({ path:'/all/competency/report/create'});
  // alert("생성하기");
  isCreateModalOpen.value = !isCreateModalOpen.value;
}

const goDetailPage = (year) => {
  router.push(`/all/competency/report/employee/${year}`);
}

</script>

<template>
  <div class="sub">역량강화 리포트 조회(인사팀)</div>

  <div class="grid">
    <div class="card">
      <div class="card-head">

        <div class="search-section">
          <div class="label">년도</div>
          <select class="select">
            <option value="">전체</option>
          </select>
        </div>

        <div class="search-btn">
          <button class="btn reset">초기화</button>
          <button class="btn primary search">검색</button>
        </div>

      </div>

    </div>
  </div>

  <div class="section-btn">
    <button class="btn primary" @click="isModalOpen()" type="button">생성하기</button>
  </div>
  <div class="card-bd">
    <table class="table">
      <thead class="tbl-hd">
      <tr>
        <th style="width:10%;">년도</th>
        <th style="width:10%;">회차</th>
        <th style="width:30%;">제목</th>
        <th style="width:10%;">담당자</th>
      </tr>
      </thead>
      <tbody class="tbl-bd">
      <tr @click="goDetailPage(2025)">
        <td >2025</td>
        <td>1</td>
        <td>2025년 1분기 역량강화 리포트</td>
        <td>김사원</td>
      </tr>
      <tr @click="goDetailPage(2025)">
        <td >2025</td>
        <td>1</td>
        <td>2025년 1분기 역량강화 리포트</td>
        <td>김사원</td>
      </tr>
      </tbody>
    </table>
  </div>

  <CompetencyReportCreateModal
    v-if="isCreateModalOpen"
    @close="isModalOpen"
  />
</template>

<style scoped>
@import "@/assets/styles/searchBox.css";

.section-btn {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  padding-right: 10px;
}


</style>
