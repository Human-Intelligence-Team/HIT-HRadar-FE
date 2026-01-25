<template>
  <div class="quick">
    <div class="category-section">
      <button class="quick-btn" v-for="category in categories" :key="category" @click="$emit('selectCategory', category)">
        {{ category }}
      </button>
    </div>
    <div class="questions-section" v-if="selectedCategory && filteredQuick.length > 0">
      <h3>{{ selectedCategory }} 관련 질문</h3>
      <button class="quick-btn" v-for="q in filteredQuick" :key="q.text" @click="$emit('pick', q.text)">
        {{ q.text }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, defineProps, computed } from 'vue'

const props = defineProps({
  selectedCategory: {
    type: String,
    default: null
  }
})

defineEmits(['pick', 'selectCategory'])

const categories = ['인사요약', '규정']

const quickQuestionsData = [
  { text: '연차 이월 기준 알려줘', category: '규정' },
  { text: '휴가 신청 절차 알려줘', category: '규정' },
  { text: '평가 결과 확인 방법 알려줘', category: '인사요약' },
  { text: '근태 기준 알려줘', category: '규정' },
  { text: '최근 공지 알려줘', category: null }, // General question
  { text: '내 연차 잔여일 알려줘', category: '인사요약' },
  { text: '개인정보 변경 절차 알려줘', category: '규정' },
];

const filteredQuick = computed(() => {
  if (!props.selectedCategory) {
    return quickQuestionsData.filter(q => q.category === null);
  }
  return quickQuestionsData.filter(q => q.category === props.selectedCategory);
});
</script>

<style scoped>
.questions-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.questions-section h3 {
  margin-bottom: 10px;
  font-size: 1em;
  color: #555;
}
</style>
