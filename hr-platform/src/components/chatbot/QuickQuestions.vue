<template>
  <div class="quick-container"> <!-- Changed class name to avoid conflict with global .quick -->
    <div class="category-section quick"> <!-- Apply quick styles here -->
      <button class="quick-btn" v-for="category in categories" :key="category" @click="$emit('selectCategory', category)">
        {{ category }}
      </button>
    </div>
    <div class="questions-section-wrapper" v-if="selectedCategory && filteredQuick.length > 0">
      <div class="questions-section quick"> <!-- Apply quick styles here as well -->
        <button class="quick-btn" v-for="q in filteredQuick" :key="q.text" @click="$emit('pick', q.text)">
          {{ q.text }}
        </button>
      </div>
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
.quick-container {
  /* This container helps stack the sections vertically */
  display: flex;
  flex-direction: column;
  padding: 12px 14px; /* Apply overall padding here */
  border-bottom: 1px solid var(--border);
}

.category-section {
  margin-bottom: 10px; /* Space between category buttons and questions */
}

.questions-section-wrapper {
  margin-top: 10px; /* Space above questions section */
  padding-top: 10px; /* Internal padding */
  border-top: 1px solid #eee; /* Separator line */
}

.questions-section h3 {
  margin-bottom: 10px;
  font-size: 1em;
  color: #555;
}
/* No need for .quick styles here as they are now applied to category-section and questions-section in the template */
</style>
