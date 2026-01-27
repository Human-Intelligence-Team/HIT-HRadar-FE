<template>
  <section>
    <div class="section-title">
      <h1>결재 문서함</h1>
      <div class="sub">내가 결재해야 할 문서 (Mock)</div>
    </div>

    <BaseCard>
      <table class="table">
        <thead>
        <tr>
          <th>문서번호</th>
          <th>기안자</th>
          <th>유형</th>
          <th>제목</th>
          <th>상태</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="d in s.approvalInbox" :key="d.id">
          <td>{{ d.id }}</td>
          <td>{{ d.writer }}</td>
          <td>{{ d.type }}</td>
          <td>{{ d.title }}</td>
          <td>{{ d.status }}</td>
        </tr>
        </tbody>
      </table>
    </BaseCard>
  </section>
</template>

<script setup>
import BaseCard from '@/components/common/BaseCard.vue'
</script>
