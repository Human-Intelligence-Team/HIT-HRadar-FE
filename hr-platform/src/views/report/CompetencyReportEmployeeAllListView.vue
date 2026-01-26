<script setup>
import { useRouter } from 'vue-router'

const router = useRouter();

const goDetailPage = (competencyReportId) => {
  router.push(`/me/competency/report/detail/${competencyReportId}`);
  // url 저장 후 넘겨주기
}

const goListPage = () => {
  router.push({ path:'/all/competency/report'});
}

</script>

<template>
  <div class="sub">역량강화 리포트 사원별 조회(인사팀)</div>

  <div class="section-btn">
    <button class="btn" @click="goListPage()" type="button">목록</button>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-head">

        <div class="search-section">
          <div class="label">부서</div>
          <input class="input" type="text"/>
        </div>

        <div class="search-section">
          <div class="label">직급</div>
          <select class="select">
            <option value="">전체</option>
          </select>
        </div>

        <div class="search-section">
          <div class="label">사번</div>
          <input class="input" type="text"/>
        </div>

        <div class="search-btn">
          <button class="btn reset">초기화</button>
          <button class="btn primary search">검색</button>
        </div>

      </div>
      <div class="card-head">

        <div class="search-section">
          <div class="label">사원명</div>
          <input class="input" type="text"/>
        </div>

      </div>
    </div>
  </div>

  <div class="card-bd">
    <table class="table">
      <thead class="tbl-hd">
      <tr>
        <th style="width:10%;">년도</th>
        <th style="width:10%;">회차</th>
        <th style="width:10%;">부서</th>
        <th style="width:10%;">직급</th>
        <th style="width:10%;">사번</th>
        <th style="width:10%;">사원명</th>
        <th style="width:30%;">제목</th>
        <th style="width:10%;">담당자</th>
      </tr>
      </thead>
      <tbody class="tbl-bd">
      <tr @click="goDetailPage(1001)">
        <td >2025</td>
        <td>1</td>
        <td>영업 1팀</td>
        <td>사원</td>
        <td >2344025</td>
        <td>김사원</td>
        <td>2025년 1분기 역량강화 리포트</td>
        <td>김사원</td>
      </tr>
      <tr @click="goDetailPage(1001)">
        <td >2025</td>
        <td>1</td>
        <td>영업 1팀</td>
        <td>사원</td>
        <td >2344025</td>
        <td>김사원</td>
        <td>2025년 1분기 역량강화 리포트</td>
        <td>김사원</td>
      </tr>
      </tbody>
    </table>
  </div>

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
