<script setup>
import {useRouter} from "vue-router";

const router = useRouter();
const goCompensationCreate = () => {
  router.push({ path:'/all/salary/compensation/create'})
}

const goDetailPage = (compensationId) => {
  router.push(`/all/salary/compensation/detail/${compensationId}`);
}
</script>

<template>
  <div class="sub">변동보상 조회(인사팀)</div>

  <div class="card">
    <div class="dashboard-box">
      <div class="dashboard-box-header">
        <div class="dashboard-box-title">
          <span class="title">2026년 변동보상 관리</span>
          <span class="sub-title">2026년 01월 01일 ~ 2026년 02월 01일</span>
        </div>
        <div>
          <button class="btn primary" @click="goCompensationCreate()">등록하기</button>
        </div>
      </div>

      <div class="dashboard-box-body">
        <div class="amount-box">
          <span class="title">총 금액</span>
          <span class="content-font">85,000,000원</span>
        </div>
        <div class="compensation-box">
          <span class="title">총 상여금</span>
          <span class="content-font">85,000,000원</span>
        </div>
        <div class="compensation-box">
          <span class="title">총 인센티브</span>
          <span class="content-font">85,000,000원</span>
        </div>
        <div class="compensation-box">
          <span class="title">총 성과금</span>
          <span class="content-font">85,000,000원</span>
        </div>
        <div class="compensation-box">
          <span class="title">기타수당</span>
          <span class="content-font">85,000,000원</span>
        </div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-bd">
      <table class="table">
        <thead class="tbl-hd">
        <tr>
          <th style="width:10%;">일자</th>
          <th style="width:30%;">제목</th>
          <th style="width:10%;">총금액</th>
          <th style="width:10%;">결재여부</th>
        </tr>
        </thead>
        <tbody class="tbl-bd">
        <tr>
          <td>2025</td>
          <td @click="goDetailPage(1)">2025년 1월 인센티브 관리</td>
          <td>85,000,000</td>
          <td>결재완료 </td>
        </tr>
        <tr>
          <td>2024</td>
          <td @click="goDetailPage(1)">2024년 기본급 관리</td>
          <td>85,000,000</td>
          <td>결재완료 </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@import "@/views/salary/style/salary.css";

.card {
  margin-top: 10px;
  padding : 20px;
}

</style>
