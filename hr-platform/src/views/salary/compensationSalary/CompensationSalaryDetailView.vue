<script setup>
import {useRouter} from "vue-router";

const router = useRouter();
const goListPage = () => {
  router.push({ path:'/all/salary/compensation'});
}
</script>

<template>
  <div class="sub">변동보상 사원 조회</div>

  <div class="section-btn">
    <button class="btn" @click="goListPage()" type="button">목록</button>
  </div>


  <div class="grid">
    <div class="card">
      <div class="card-head">
        <div class="search-section">
          <span class="label">재직상태</span>
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

        <div class="search-section">
          <div class="label">날짜</div>
          <select class="select">
            <option value="">2026</option>
          </select>
          <select class="select">
            <option value="">전체</option>
          </select>
        </div>


      </div>
    </div>
  </div>


  <div class="card">
    <div class="card-bd">
      <table class="table">
        <thead class="tbl-hd">
        <tr>
          <th style="width:10%;">재직상태</th>
          <th style="width:10%;">부서</th>
          <th style="width:10%;">직급</th>
          <th style="width:10%;">사번</th>
          <th style="width:10%;">사원명</th>
          <th style="width:10%;">변동보상 유형</th>
          <th style="width:20%;">비고</th>
          <th style="width:10%;">날짜</th>
        </tr>
        </thead>
        <tbody class="tbl-bd">
        <tr @click="goDetailPage(1)">
          <td>재직중</td>
          <td>영업</td>
          <td>사원</td>
          <td>12345677</td>
          <td>김사원</td>
          <td>기타수당</td>
          <td>교통비</td>
          <td>2025-01</td>
        </tr>
        <tr  @click="goDetailPage(1)">
          <td>재직중</td>
          <td>영업</td>
          <td>사원</td>
          <td>12345677 </td>
          <td>김사원 </td>
          <td>기타수당</td>
          <td>교통비</td>
          <td>2025-01</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/styles/searchBox.css";

.section-btn {
  display: flex;
  justify-content: flex-end;
  padding: 5px;
}

</style>
