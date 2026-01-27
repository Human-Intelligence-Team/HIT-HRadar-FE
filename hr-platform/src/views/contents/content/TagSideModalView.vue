<script setup>
const emit = defineEmits(['close'])

const isModalOpen = () => {
  emit('close')
}

const tagCreate = () => {
  alert("등록하시겠습니까?")
}

const tagDelete = () => {
  alert("삭제하시겠습니까?");
}
</script>

<template>
  <div class="side-box">
    <div class="side-header">
      <span class="side-box-title">태그 목록</span>
      <span  @click="isModalOpen()" >X</span>
    </div>
    <div class="side-search">
      <div>
        <th>태그명</th>
        <td><input class="input " type="text"></td>
      </div>
      <div>
        <button class="btn primary" @click="tagCreate">등록</button>
      </div>
    </div>
    <div class="side-content">
      <table class="table">
        <thead class="tbl-hd">
        <tr>
          <th style="width:40%;">태그 명</th>
          <th style="width:40%;">사용 개수</th>
        </tr>
        </thead>
        <tbody class="tbl-bd">
        <tr>
          <td>영업</td>
          <td>30</td>
        </tr>
        <tr>
          <td>영업</td>
          <td>30</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@import '@/views/contents/style/sideBox.css';

.table th {
  width: 20%;
  text-align: center;
  vertical-align: middle;
  background-color: #eaf0ff;
}

.table td {
  width: 30%;
  text-align: center;
  vertical-align: middle;
}
</style>
