<script setup>
import {useRouter} from "vue-router";

const router = useRouter();
const goDetailPage = (basicId) => {
  router.push(`/me/salary/history/${basicId}`);
}
const goListPage = () => {
  router.push({ path:'/all/salary/basic'});
}

</script>

<template>
  <div class="sub">사원별 관리</div>

  <div class="section-btn">
    <button class="btn" @click="goListPage()" type="button">목록</button>
  </div>

    <div class="card">
      <div class="card-head">
        <div class="search-section">
          <div class="label">재직상태</div>
          <select class="select">
            <option value="">전체</option>
          </select>
        </div>

        <div class="search-section">
          <div class="label">부서</div>
          <select class="select">
            <option value="">전체</option>
          </select>
        </div>
        <div class="search-section">
          <div class="label">직급</div>
          <select class="select">
            <option value="">전체</option>
          </select>
        </div>

        <div class="search-btn">
          <button class="btn reset">초기화</button>
          <button class="btn primary search">검색</button>
        </div>

      </div>
      <div class="card-head">
        <div class="search-section">
          <div class="label">사번</div>
          <input class="input" type="text"/>
        </div>

        <div class="search-section">
          <div class="label">사원명</div>
          <input class="input" type="text"/>
        </div>

      </div>
    </div>

  <div class="card">
    <table class="table">
      <thead class="tbl-hd">
      <tr>
        <th style="width:10%;">재직상태</th>
        <th style="width:30%;">부서</th>
        <th style="width:10%;">직급</th>
        <th style="width:10%;">사번</th>
        <th style="width:10%;">사원명</th>
        <th style="width:10%;">인상사유</th>
      </tr>
      </thead>
      <tbody class="tbl-bd">
      <tr @click="goDetailPage(1)">
        <td>재직중</td>
        <td>영업</td>
        <td>사원</td>
        <td>12345677</td>
        <td>김사원</td>
        <td>승진</td>
      </tr>
      <tr  @click="goDetailPage(1)">
        <td>재직중</td>
        <td>영업</td>
        <td>사원</td>
        <td>12345677 </td>
        <td>김사원 </td>
        <td>승진</td>
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
