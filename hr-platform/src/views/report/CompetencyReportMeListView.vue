<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goDetailPage = (competencyReportId) => {
  router.push(`/me/competency/report/detail/${competencyReportId}`)
  // url 저장 후 넘겨주기
}
</script>

<template>
  <div class="sub">역량강화 리포트 조회(본인)</div>

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

    <div class="card">
        <table class="table">
          <thead class="tbl-hd">
            <tr>
              <th style="width: 10%">년도</th>
              <th style="width: 10%">회차</th>
              <th style="width: 30%">제목</th>
              <th style="width: 10%">담당자</th>
            </tr>
          </thead>
          <tbody class="tbl-bd">
            <tr @click="goDetailPage(2025)">
              <td>2025</td>
              <td>1</td>
              <td>2025년 1분기 역량강화 리포트</td>
              <td>김사원</td>
            </tr>
            <tr @click="goDetailPage(2025)">
              <td>2025</td>
              <td>1</td>
              <td>2025년 1분기 역량강화 리포트</td>
              <td>김사원</td>
            </tr>
          </tbody>
        </table>
      </div>
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';
</style>
