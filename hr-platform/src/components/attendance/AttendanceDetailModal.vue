<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <Transition name="slide-up">
        <div class="modal-card">
          <div class="modal-header">
            <h3>근무 상세 정보</h3>
            <button class="btn-close" @click="close">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="info-group">
              <label>부서</label>
              <div class="value">{{ attendance?.deptName || '미지정 부서' }}</div>
            </div>
            
            <div class="info-group">
              <label>사원 이름</label>
              <div class="value name-value">{{ attendance?.employeeName }}</div>
            </div>

            <div class="divider"></div>

            <div class="info-grid">
              <div class="info-group">
                <label>근무 날짜</label>
                <div class="value">{{ attendance?.workDate }}</div>
              </div>
              <div class="info-group">
                <label>상태</label>
                <div class="value">
                  <span :class="['status-badge', getStatusClass(attendance?.status)]">
                    {{ attendance?.status || '출근전' }}
                  </span>
                </div>
              </div>
              <div class="info-group">
                <label>근무 장소</label>
                <div class="value">{{ attendance?.workPlace || '미지정' }}</div>
              </div>
              <div class="info-group">
                <label>근무 유형</label>
                <div class="value">{{ attendance?.workType || '미지정' }}</div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-confirm" @click="close">확인</button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  attendance: Object
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

const getStatusClass = (status) => {
  if (!status) return 'default';
  if (status.includes('휴가')) return 'leave';
  if (status.includes('출근')) return 'working';
  if (status.includes('병가')) return 'sick';
  if (status.includes('반차')) return 'half-leave';
  return 'default';
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-card {
  background: #ffffff;
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 24px;
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #adb5bd;
  cursor: pointer;
}

.info-group {
  margin-bottom: 16px;
}

.info-group label {
  display: block;
  font-size: 13px;
  color: #868e96;
  margin-bottom: 6px;
}

.info-group .value {
  font-size: 16px;
  color: #212529;
  font-weight: 500;
}

.name-value {
  font-size: 20px !important;
  font-weight: 700 !important;
}

.divider {
  height: 1px;
  background: #f1f3f5;
  margin: 20px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.working { background: #e7f5ff; color: #1c7ed6; }
.status-badge.leave { background: #fff4e6; color: #fd7e14; }
.status-badge.sick { background: #fff0f6; color: #d6336c; }
.status-badge.half-leave { background: #f3f0ff; color: #7048e8; }
.status-badge.default { background: #f8f9fa; color: #495057; }

.modal-footer {
  margin-top: 32px;
}

.btn-confirm {
  width: 100%;
  padding: 14px;
  background: #3182f6;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirm:hover {
  background: #1b64da;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(20px); opacity: 0; }
</style>
