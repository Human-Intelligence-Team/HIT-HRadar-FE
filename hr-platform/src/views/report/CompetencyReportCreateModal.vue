<script setup>
const emit = defineEmits(['close'])

const isModalOpen = () => {
  emit('close')
}

const createCompetencyReport = () => {
  alert("생성하기");
}
</script>

<template>
  <div class="overlay">
    <div class="modal">
      <div class="modal-head">
        <div class="modal-title">
          역량강화 리포트 생성
        </div>
        <button class="btn ghost" @click="isModalOpen">닫기</button>
      </div>

      <div class="modal-search">
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
      <div class="modal-body">
        <table class="table">
          <thead class="tbl-hd">
          <tr>
            <th style="width:10%;">년도</th>
            <th style="width:10%;">회차</th>
            <th style="width:20%;">제목</th>
            <th style="width:10%;">담당자</th>
            <th style="width:10%;"></th>
          </tr>
          </thead>
          <tbody class="tbl-bd">
          <tr>
            <td >2025</td>
            <td>1</td>
            <td>2025년 1분기 역량강화 리포트</td>
            <td>김사원</td>
            <td><button class="btn"
                        type="button"
                        @click="createCompetencyReport"
            >생성하기</button></td>
          </tr>
          <tr>
            <td >2025</td>
            <td>1</td>
            <td>2025년 1분기 역량강화 리포트</td>
            <td>김사원</td>
            <td>생성 완료</td>
          </tr>
          </tbody>
        </table>
        <div class="hint">
          * 이미 생성된 리포트는 다시 생성할 수 없습니다.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/styles/searchBox.css";
.modal-search {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin: 20px;

  border: 1px solid var(--border);   /* 테두리 */
  border-radius: 12px;               /* 라운드 */
  background: rgba(255, 255, 255, 0.03); /* 살짝 배경 */
}

.modal-body .table td {
  vertical-align: middle;
}
</style>
