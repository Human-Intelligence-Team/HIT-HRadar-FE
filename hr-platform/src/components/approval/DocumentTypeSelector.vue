<template>
  <div class="document-type-selector">
    <label v-if="label">{{ label }}</label>
    <select
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="input-field"
    >
      <option value="">-- 선택 --</option>
      <option v-for="type in dynamicDocumentTypes" :key="type.value" :value="type.value">
        {{ type.text }}
      </option>
    </select>
    <small v-if="hint" class="hint">{{ hint }}</small>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import { fetchApprovalDocumentTypes } from '@/api/approvalApi';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const dynamicDocumentTypes = ref([]);

onMounted(async () => {
  try {
    const response = await fetchApprovalDocumentTypes();
    dynamicDocumentTypes.value = response.data.data.map(type => ({ value: type.docType, text: type.name }));
  } catch (error) {
    console.error('결재 문서 유형을 불러오는 데 실패했습니다:', error);
    // Optionally provide a fallback or alert the user
  }
});
</script>

<style scoped>
.document-type-selector {
  margin-bottom: 20px;
}

.document-type-selector label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
  background-color: #fff; /* Ensure white background for select */
}

.input-field:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

.hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  display: block;
}
</style>
