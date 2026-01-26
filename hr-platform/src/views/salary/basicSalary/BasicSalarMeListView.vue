<script setup>
import {useRouter} from "vue-router";

const router = useRouter();
const goDetailPage = (basicId) => {
  router.push(`/me/salary/history/${basicId}`);
}
</script>

<template>
  <div class="sub">기본급 조회(사원)</div>

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

  <div class="card-bd">
    <table class="table">
      <thead class="tbl-hd">
      <tr>
        <th style="width:10%;">년도</th>
        <th style="width:10%;">부서</th>
        <th style="width:10%;">직급</th>
        <th style="width:10%;">이름</th>
      </tr>
      </thead>
      <tbody class="tbl-bd">
      <tr @click="goDetailPage(1)">
        <td >2025</td>
        <td>영업</td>
        <td>사원</td>
        <td>김사원</td>
      </tr>
      <tr @click="goDetailPage(1)">
        <td >2025</td>
        <td>영업</td>
        <td>사원</td>
        <td>김사원</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@import "@/assets/styles/searchBox.css";
</style>
