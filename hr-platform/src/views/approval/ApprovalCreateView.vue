<template>
  <div class="page">
    <div class="section-title">
      <h1>결재 문서 등록</h1>
    </div>

    <section class="card form-card">
      <DocumentTypeSelector label="문서 유형" v-model="form.docType" />

      <div class="form-group">
        <label for="title">제목</label>
        <input type="text" id="title" v-model="form.title" class="input-field" placeholder="제목을 입력하세요." />
      </div>

      <div class="form-group">
        <label for="content">본문</label>
        <textarea id="content" v-model="form.content" class="input-field" rows="5" placeholder="내용을 입력하세요."></textarea>
      </div>

      <DepartmentEmployeeSelector label="결재자" v-model="form.approverIds" hint="결재자를 검색하여 추가하세요." />

      <DepartmentEmployeeSelector label="참조자 (선택 사항)" v-model="form.referenceIds" hint="참조자를 검색하여 추가하세요. (선택 사항)" />

      <div class="form-group">
        <label for="payload">추가 정보 (JSON 형식, 선택 사항)</label>
        <textarea id="payload" v-model="payloadInput" class="input-field" rows="5" placeholder="{ &quot;key&quot;: &quot;value&quot; } (선택 사항)"></textarea>
        <small class="hint">문서 유형에 따라 필요한 추가 정보를 JSON 형태로 입력하세요.</small>
      </div>

      <div class="form-actions">
        <button class="btn btn-secondary" @click="saveDraft">임시저장</button>
        <button class="btn btn-primary" @click="handleSubmitApproval">상신</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DocumentTypeSelector from '@/components/approval/DocumentTypeSelector.vue';
import DepartmentEmployeeSelector from '@/components/approval/DepartmentEmployeeSelector.vue';
import {
  createApprovalDraft,
  submitApproval,
  fetchApprovalDetail,
} from '@/api/approvalApi';

const route = useRoute();
const router = useRouter();

const docId = ref(null);
const form = ref({
  docType: '',
  title: '',
  content: '',
  approverIds: [],
  referenceIds: [],
});
const payloadInput = ref('');

const payload = computed(() => {
  try {
    return payloadInput.value ? JSON.parse(payloadInput.value) : null;
  } catch (e) {
    console.error('Invalid JSON payload:', e);
    alert('추가 정보가 올바른 JSON 형식이 아닙니다.');
    return null;
  }
});

onMounted(async () => {
  if (route.params.id) {
    docId.value = parseInt(route.params.id);
    try {
      const response = await fetchApprovalDetail(docId.value);
      const detail = response.data.data;
      if (detail) {
        form.value.docType = detail.docType;
        form.value.title = detail.title;
        form.value.content = detail.content;
        form.value.approverIds = detail.approverIds || [];
        form.value.referenceIds = detail.referenceIds || [];
        // payloadInput.value = JSON.stringify(detail.payload, null, 2); // If payload is returned
      }
    } catch (error) {
      alert('결재 문서를 불러오는 데 실패했습니다.');
      console.error('Failed to fetch approval detail:', error);
      docId.value = null;
    }
  }
});

const validateForm = () => {
  if (!form.value.docType) {
    alert('문서 유형을 선택해주세요.');
    return false;
  }
  if (!form.value.title.trim()) {
    alert('제목을 입력해주세요.');
    return false;
  }
  if (!form.value.content.trim()) {
    alert('본문을 입력해주세요.');
    return false;
  }
  if (form.value.approverIds.length === 0) {
    alert('결재자를 1명 이상 지정해주세요.');
    return false;
  }
  if (payloadInput.value && !payload.value) {
    // payload computed property already handles invalid JSON and alerts
    return false;
  }
  return true;
};

const saveDraft = async () => {
  if (!validateForm()) return;

  try {
    const request = {
      docType: form.value.docType,
      title: form.value.title,
      content: form.value.content,
      approverIds: form.value.approverIds,
      referenceIds: form.value.referenceIds,
      payload: payload.value,
    };
    const response = await createApprovalDraft(request);
    alert('문서가 임시저장되었습니다. 문서 ID: ' + response.data.data);
    router.push(`/approval/my-documents`); // Navigate to my documents list
  } catch (error) {
    alert('임시저장에 실패했습니다.');
    console.error('Failed to save draft:', error);
  }
};

const handleSubmitApproval = async () => {
  if (!validateForm()) return;

  try {
    let currentDocId = docId.value;
    if (!currentDocId) {
      // If it's a new document, save as draft first then submit
      const draftRequest = {
        docType: form.value.docType,
        title: form.value.title,
        content: form.value.content,
              approverIds: form.value.approverIds,
              referenceIds: form.value.referenceIds,        payload: payload.value,
      };
      const draftResponse = await createApprovalDraft(draftRequest); // This will save as DRAFT first
      currentDocId = draftResponse.data.data;
    }

    await submitApproval(currentDocId); // Then submit the document
    alert('문서가 성공적으로 상신되었습니다.');
    router.push(`/approval/my-documents`); // Navigate to my documents list
  } catch (error) {
    alert('문서 상신에 실패했습니다.');
    console.error('Failed to submit approval:', error);
  }
};
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 16px;
}

.section-title {
  margin-bottom: 20px;
}

.section-title h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.section-title .sub {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
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
}

.input-field:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

textarea.input-field {
  resize: vertical;
}

.hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background-color: #007bff;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: #ffffff;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
</style>
