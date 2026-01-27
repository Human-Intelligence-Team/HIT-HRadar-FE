<template>
  <section>
    <div class="section-title">
      <h1>반려 문서함</h1>
      <div class="sub">반려된 문서 (Mock)</div>
    </div>

    <BaseCard>
      <table class="table">
        <thead>
        <tr>
          <th>문서번호</th>
          <th>유형</th>
          <th>제목</th>
          <th>반려사유</th>
          <th>반려일</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="d in s.approvalRejected" :key="d.id">
          <td>{{ d.id }}</td>
          <td>{{ d.type }}</td>
          <td>{{ d.title }}</td>
          <td>{{ d.reason }}</td>
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
