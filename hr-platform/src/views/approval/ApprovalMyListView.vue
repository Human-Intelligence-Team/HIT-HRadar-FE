<template>
  <section>
    <div class="section-title">
      <h1>내 문서함</h1>
      <div class="sub">내가 기안한 문서 (Mock)</div>
    </div>

    <BaseCard>
      <table class="table">
        <thead>
        <tr>
          <th>문서번호</th>
          <th>유형</th>
          <th>제목</th>
          <th>상태</th>
          <th>기안일</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="d in s.approvalMy" :key="d.id">
          <td>{{ d.id }}</td>
          <td>{{ d.type }}</td>
          <td>{{ d.title }}</td>
          <td>{{ d.status }}</td>
          <td>{{ d.date }}</td>
        </tr>
        </tbody>
      </table>
    </BaseCard>
  </section>
</template>

<script setup>
import BaseCard from '@/components/common/BaseCard.vue'
</script>
