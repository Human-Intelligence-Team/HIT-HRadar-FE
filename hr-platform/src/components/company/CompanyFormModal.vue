<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>회사 정보 수정</h3>
        <button class="close-btn" @click="$emit('close')" type="button" aria-label="Close">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <line x1="18" y1="6" x2="6" y2="18"></line>
             <line x1="6" y1="6" x2="18" y2="18"></line>
           </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="$emit('submit')" id="companyForm" class="form-grid">
           <!-- Row 1 -->
           <div class="form-group">
            <label>회사명</label>
            <input 
              type="text" 
              v-model="modelValue.comName" 
              placeholder="회사 이름을 입력하세요" 
              required 
              class="input"
            />
          </div>
          <div class="form-group">
            <label>사업자 등록번호</label>
            <input 
              type="text" 
              v-model="modelValue.bizNo" 
              placeholder="000-00-00000" 
              class="input"
              disabled
            />
          </div>

          <!-- Row 2 -->
          <div class="form-group">
            <label>대표자명</label>
             <input 
                type="text" 
                v-model="modelValue.ceoName" 
                placeholder="대표자 성함을 입력하세요" 
                class="input"
              />
          </div>
          <div class="form-group">
            <label>설립일</label>
            <input 
              type="date" 
              v-model="modelValue.foundDate" 
              class="input"
            />
          </div>

          <!-- Row 3 -->
           <div class="form-group">
            <label>회사 이메일</label>
             <input 
                type="email" 
                v-model="modelValue.comEmail" 
                placeholder="example@company.com" 
                class="input"
              />
          </div>
          <div class="form-group">
            <label>대표 전화</label>
             <input 
                type="text" 
                v-model="modelValue.comTel" 
                placeholder="02-0000-0000" 
                class="input"
              />
          </div>

          <!-- Row 4 (Full Width) -->
           <div class="form-group" style="grid-column: 1 / -1;">
            <label>주소</label>
            <input 
              type="text" 
              v-model="modelValue.address" 
              placeholder="회사 주소를 입력하세요" 
              class="input"
            />
          </div>
          
           <!-- Footer -->
          <div class="form-actions">
            <button type="button" class="btn secondary" @click="$emit('close')" :disabled="submitting">
              취소
            </button>
            <button type="submit" class="btn primary" :disabled="submitting">
              {{ submitting ? '저장 중...' : '수정 저장' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  submitting: Boolean,
  modelValue: {
    type: Object,
    required: true
  }
})

defineEmits(['close', 'submit', 'update:modelValue'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 720px; /* Standard Size */
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.close-btn:hover {
  background-color: #f1f5f9;
  color: #ef4444;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none; /* Prevent focus outline */
}
/* Fix Autofill Yellow */
.input:-webkit-autofill,
.input:-webkit-autofill:hover, 
.input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
  transition: background-color 5000s ease-in-out 0s;
}
.input:focus {
  border-color: #3b82f6; 
  outline: none;
}
.input:disabled {
  background: #f8fafc;
  color: #94a3b8;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn.primary { background: #3b82f6; color: white; }
.btn.secondary { background: #f3f4f6; color: #1e293b; }
.btn:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
