<template>
  <div v-if="show" class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-head">
        <div class="modal-title">
          <div class="bot-badge">
            <i class="pi pi-cog"></i>
          </div>
          <span>{{ isEdit ? '직위 정보 수정' : '새 직위 등록' }}</span>
        </div>
        <button class="btn ghost btn-sm" @click="$emit('close')">
          <i class="pi pi-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <div class="label">직위명</div>
          <input 
            type="text" 
            v-model="modelValue.name" 
            placeholder="예: 사원, 대리, 부장" 
            required 
            class="input"
          />
        </div>
        <div class="form-group">
          <div class="label">순위 (서열 순서)</div>
          <input 
            type="number" 
            v-model.number="modelValue.rank" 
            placeholder="숫자가 낮을수록 서열이 높습니다." 
            required 
            class="input"
          />
          <div class="hint">서열을 결정하는 숫자입니다. (예: 1, 2, 3...)</div>
        </div>
      </div>
      
      <div class="modal-foot">
        <button type="button" class="btn ghost" style="flex: 1" @click="$emit('close')" :disabled="submitting">
          취소
        </button>
        <button type="button" class="btn primary" style="flex: 2" @click="$emit('submit')" :disabled="submitting">
          {{ submitting ? '처리 중...' : (isEdit ? '수정 완료' : '등록하기') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  isEdit: Boolean,
  submitting: Boolean,
  modelValue: {
    type: Object,
    required: true
  }
})

defineEmits(['close', 'submit', 'update:modelValue'])
</script>

<style scoped>
.form-group { margin-bottom: 20px; }
.form-group:last-child { margin-bottom: 0; }

.input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.input:focus {
  border-color: #3b82f6;
}
/* Fix Autofill Yellow */
.input:-webkit-autofill,
.input:-webkit-autofill:hover, 
.input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.modal {
  width: min(440px, 94vw);
  height: auto;
  max-height: 90vh;
}

.modal-body {
  padding: 24px;
}

/* Base styles should be covered by app.css, overriding only if necessary */
.hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
