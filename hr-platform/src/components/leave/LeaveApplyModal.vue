<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-card">
      <div class="modal-header">
        <h2>휴가 신청</h2>
        <button @click="close" class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitLeaveApplication">
          <!-- 결재 정보 -->
          <div class="form-section">
            <h3>1. 결재 정보</h3>
            <div class="form-grid">
              <div class="form-field">
                <label for="docType">결재 문서 종류</label>
                <select id="docType" v-model="approvalInfo.docType" required>
                  <option disabled value="">문서 종류 선택</option>
                  <option v-for="type in documentTypes" :key="type.typeId" :value="type.docType">
                    {{ type.name }}
                  </option>
                </select>
              </div>
              <div class="form-field">
                <label for="docTitle">결재 문서 제목</label>
                <input id="docTitle" type="text" v-model="approvalInfo.title" required placeholder="예: [휴가] 홍길동 연차 신청">
              </div>
            </div>
            <div class="form-field">
              <label>결재선 (결재자)</label>
              <DepartmentEmployeeSelector v-model="approvalInfo.approverIds" hint="결재할 사원을 선택하세요." />
            </div>
            <div class="form-field">
              <label>참조선 (참조자)</label>
              <DepartmentEmployeeSelector v-model="approvalInfo.referenceIds" hint="참조할 사원을 선택하세요." :allowDeptSelection="true" />
            </div>
          </div>

          <!-- 휴가 정보 -->
          <div class="form-section">
            <h3>2. 휴가 정보</h3>
            <div class="form-grid">
              <div class="form-field">
                <label for="leaveGrant">사용할 연차</label>
                <select id="leaveGrant" v-model="leaveInfo.grantId" required>
                  <option disabled value="">연차 정보 선택</option>
                  <option v-for="grant in availableGrants" :key="grant.grantId" :value="grant.grantId">
                    {{ grant.year }}년도 연차 (잔여: {{ grant.remainingDays }}일)
                  </option>
                </select>
              </div>
              <div class="form-field">
                <label for="leaveType">휴가 종류</label>
                <select id="leaveType" v-model="leaveInfo.leaveType" required>
                  <option disabled value="">휴가 종류 선택</option>
                  <option v-for="policy in leavePolicies" :key="policy.policyId" :value="policy.typeName">
                    {{ policy.typeName }}
                  </option>
                  <option v-if="leavePolicies.length === 0" value="연차">연차 (기본)</option>
                  <option v-if="leavePolicies.length === 0" value="경조사">경조사 (기본)</option>
                </select>
              </div>
              <div class="form-field">
                <label for="leaveUnitType">휴가 단위</label>
                <select id="leaveUnitType" v-model="leaveInfo.leaveUnitType" required>
                  <option value="FULL">일차</option>
                  <option value="HALF_AM">오전반차</option>
                  <option value="HALF_PM">오후반차</option>
                </select>
              </div>
              <div class="form-field">
                <label for="leaveDays">사용일수</label>
                <input type="number" id="leaveDays" v-model.number="leaveInfo.leaveDays" required min="0" step="0.1">
              </div>
              <div class="form-field">
                <label for="startDate">시작일</label>
                <input type="date" id="startDate" v-model="leaveInfo.startDate" required>
              </div>
              <div class="form-field">
                <label for="endDate">종료일</label>
                <input type="date" id="endDate" v-model="leaveInfo.endDate" required>
              </div>
            </div>
            <div class="form-field">
              <label for="reason">휴가 사유</label>
              <textarea id="reason" v-model="leaveInfo.reason" rows="3" placeholder="휴가 사유를 입력하세요."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="close" class="btn-secondary">취소</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? '처리 중...' : '신청 및 결재 요청' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { createLeaveDraft, applyLeave, getLeavePolicies } from '@/api/leaveApi';
import { fetchApprovalDocumentTypes  } from '@/api/approvalApi';
import DepartmentEmployeeSelector from '@/components/approval/DepartmentEmployeeSelector.vue';

const emit = defineEmits(['close', 'submitted']);
const props = defineProps({
    availableGrants: {
        type: Array,
        default: () => []
    }
});
const router = useRouter();

const isSubmitting = ref(false);
const documentTypes = ref([]);
const leavePolicies = ref([]);
const authStore = useAuthStore();

const approvalInfo = ref({
  docType: '',
  title: `[휴가신청] ${new Date().getFullYear()}년`,
  approverIds: [],
  referenceIds: [],
});

const leaveInfo = ref({
  grantId: null,
  leaveType: '연차',
  leaveUnitType: 'FULL',
  reason: '',
  startDate: '',
  endDate: '',
  leaveDays: 1,
});


// updateApprovalLine is removed as we use v-model

// Watchers for date calculation
import { watch } from 'vue';

watch([() => leaveInfo.value.startDate, () => leaveInfo.value.endDate], ([start, end]) => {
  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (errorMessage.value) errorMessage.value = '';

    if (startDate > endDate) {
      // alert('종료일은 시작일보다 빠를 수 없습니다.');
      leaveInfo.value.endDate = leaveInfo.value.startDate;
      return;
    }

    // Calculate business days (M-F) 
    // Simplified logic: just total days - weekends
    let count = 0;
    let current = new Date(startDate);
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0=Sun, 6=Sat
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    // Adjust for half-day
    if (leaveInfo.value.leaveUnitType.startsWith('HALF')) {
        leaveInfo.value.leaveDays = 0.5;
        // Half day implies single day usually
        if (start !== end) {
             // If user selected range for half day, it might mean "half day foreach day" or error.
             // Usually half day is single date. enforce it?
             // For now, let's just count 0.5 * days
             leaveInfo.value.leaveDays = count * 0.5;
        }
    } else {
        leaveInfo.value.leaveDays = count;
    }
  }
});

watch(() => leaveInfo.value.leaveUnitType, (newVal) => {
    if (newVal.startsWith('HALF')) {
        leaveInfo.value.leaveDays = 0.5;
        // Optionally force start=end
        if (leaveInfo.value.startDate && leaveInfo.value.startDate !== leaveInfo.value.endDate) {
            leaveInfo.value.endDate = leaveInfo.value.startDate;
        }
    } else {
        // Re-trigger date calc
        const start = leaveInfo.value.startDate;
        const end = leaveInfo.value.endDate;
        if (start && end) {
             // Logic repeated, ideal to extract function
             const startDate = new Date(start);
             const endDate = new Date(end);
             let count = 0;
             let current = new Date(startDate);
             while (current <= endDate) {
               if (current.getDay() !== 0 && current.getDay() !== 6) count++;
               current.setDate(current.getDate() + 1);
             }
             leaveInfo.value.leaveDays = count;
        }
    }
});

const errorMessage = ref(''); 

const fetchInitialData = async () => {
  try {
    const [docTypesRes, policiesRes] = await Promise.all([
      fetchApprovalDocumentTypes(),
      getLeavePolicies(authStore.user?.companyId)
    ]);

    const allDocTypes = docTypesRes?.data?.data || [];
    documentTypes.value = allDocTypes.filter(t => (t.active || t.isActive) && t.isDeleted !== 'Y');
    leavePolicies.value = policiesRes?.data?.data || [];

    if (documentTypes.value.length > 0) {
      // 자동 선택: 휴가 관련 문서 유형 찾기
      const leaveType = documentTypes.value.find(t => t.docType.includes('LEAVE') || t.name.includes('휴가'));
      if (leaveType) {
        approvalInfo.value.docType = leaveType.docType;
      } else {
        approvalInfo.value.docType = documentTypes.value[0].docType;
      }
    }

    if (props.availableGrants.length > 0) {
      leaveInfo.value.grantId = props.availableGrants[0].grantId;
    }
  } catch (error) {
    console.error('초기 데이터 로딩 실패:', error);
    alert('데이터를 불러오는 데 실패했습니다.');
  }
};

const submitLeaveApplication = async () => {
  if (isSubmitting.value) return;

  // 유효성 검사
  if (!approvalInfo.value.docType) {
    alert('결재 문서 종류를 선택해주세요.');
    return;
  }
  if (!approvalInfo.value.title.trim()) {
    alert('결재 문서 제목을 입력해주세요.');
    return;
  }
  if (approvalInfo.value.approverIds.length === 0) {
    alert('결재자를 최소 1명 이상 선택해주세요.');
    return;
  }
  if (!leaveInfo.value.grantId) {
    alert('사용할 연차를 선택해주세요.');
    return;
  }

  // Check Remaining Days
  const selectedGrant = props.availableGrants.find(g => g.grantId === leaveInfo.value.grantId);
  if (selectedGrant) {
    if (leaveInfo.value.leaveDays > selectedGrant.remainingDays) {
        alert(`잔여 연차가 부족합니다. (신청: ${leaveInfo.value.leaveDays}일, 잔여: ${selectedGrant.remainingDays}일)`);
        return;
    }
  }

  isSubmitting.value = true;

  try {
    const draftRequest = {
      docType: approvalInfo.value.docType,
      title: approvalInfo.value.title,
      content: leaveInfo.value.reason || '휴가 신청',
      approverIds: approvalInfo.value.approverIds,
      referenceIds: approvalInfo.value.referenceIds,
      payload: {},
      Payload: {}
    };

    console.log('🔍 휴가 신청 Draft 요청:', draftRequest);

    const draftResponse = await createLeaveDraft(draftRequest);
    const docId = draftResponse.data.data;

    console.log('✅ Draft 생성 성공, docId:', docId);

    if (!docId) {
      throw new Error('결재 문서 생성에 실패했습니다.');
    }

    const leaveRequest = {
      grantId: leaveInfo.value.grantId,
      leaveType: leaveInfo.value.leaveType,
      leaveUnitType: leaveInfo.value.leaveUnitType,
      reason: leaveInfo.value.reason || '휴가 신청',
      startDate: leaveInfo.value.startDate,
      endDate: leaveInfo.value.endDate,
      leaveDays: leaveInfo.value.leaveDays,
    };

    console.log('🔍 휴가 정보 저장 요청:', leaveRequest);

    await applyLeave(docId, leaveRequest);
    alert('휴가 신청이 성공적으로 제출되었습니다.');
    emit('submitted');
    close();
    router.push(`/approval/${docId}`);

  } catch (error) {
    console.error('❌ 휴가 신청 처리 중 오류 발생:', error);
    console.error('에러 상세:', error.response?.data);
    const errorMessage = error.response?.data?.message || '휴가 신청 중 오류가 발생했습니다.';
    alert(errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};

const close = () => {
  emit('close');
};

onMounted(fetchInitialData);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  color: #9ca3af;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
}
.form-field textarea {
    resize: vertical;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #1f2937;
}
</style>
