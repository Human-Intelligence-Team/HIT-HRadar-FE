<template>
  <div class="quick">
    <div class="category-section">
      <button class="quick-btn" v-for="category in categories" :key="category" @click="$emit('selectCategory', category)">
        {{ category }}
      </button>
    </div>
    <div class="questions-section">
      <button class="quick-btn" v-for="q in quick" :key="q" @click="$emit('pick', q)">
        {{ q }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['pick', 'selectCategory'])
const categories = ['인사요약', '규정']
const quick = [
  '연차 이월 기준 알려줘',
  '휴가 신청 절차 알려줘',
  '평가 결과 확인 방법 알려줘',
  '근태 기준 알려줘',
  '최근 공지 알려줘',
]
</script>
