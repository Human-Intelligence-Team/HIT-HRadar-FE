<template>
  <div class="page">
    <div class="section-title">
      <h1>결재 문서 상세</h1>
    </div>

    <section v-if="document" class="card approval-detail-card">
      <!-- Header Section -->
      <div class="detail-header-column">
        <div class="header-top">
          <h2 class="doc-title">{{ document.title }}</h2>
          <span :class="['status-badge', document.status.toLowerCase()]">{{ document.status }}</span>
        </div>
        <div class="header-meta-row">
          <span class="meta-label">문서 유형:</span>
          <span class="meta-value">{{ document.docType }}</span>
          <span class="divider">|</span>
          <span class="meta-label">제출 일시:</span>
          <span class="meta-value">{{ formatDate(document.submittedAt) }}</span>
        </div>
      </div>

      <div class="detail-content">
        <h3>본문</h3>
        <p>{{ document.content }}</p>
      </div>

      <!-- Placeholder for "Leave Details" if needed later ("본문 밑에 휴가 있고") -->
      <!-- Ideally we would render dynamic components here based on docType -->

      <hr />

      <ApprovalLineDisplay :steps="document.approvalSteps" />
      
      <div v-if="document.references && document.references.length > 0" class="approval-references">
        <h3>참조자</h3>
        <div class="reference-container">
          <div class="reference-list">
            <span v-for="ref in visibleReferences" :key="ref.referenceId" class="reference-item">
              {{ ref.referrerName }} ({{ ref.referrerId }})
            </span>
          </div>
          <button 
            v-if="document.references.length > 5 && !isReferencesExpanded" 
            @click="isReferencesExpanded = true" 
            class="btn-more-refs"
          >
            + 더보기
          </button>
        </div>
      </div>

      <hr />

      <ApprovalHistoryDisplay :histories="document.histories" />

      <hr />

      <div class="approval-comments">
        <h3>댓글</h3>
        <div class="comment-section-body">
            <p v-if="!document.comments || document.comments.length === 0" class="no-comments">아직 댓글이 없습니다.</p>
            <div v-else class="comment-list-container">
            <div v-for="comment in document.comments" :key="comment.commentId" :class="['comment-item', { 'is-reply': comment.parentCommentId }]">
                <div class="comment-header">
                <span class="comment-writer">{{ comment.writerName || comment.writerId }}</span>
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                <button v-if="canAddComment" @click="replyTo(comment)" class="btn-small btn-reply">답글</button>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
            </div>
            </div>

            <!-- Styled Comment Input -->
            <div v-if="canAddComment" class="comment-input-area styled-input">
                <div v-if="replyToCommentId" class="reply-indicator">
                    <span><strong>{{ replyToCommentWriter }}</strong> 님에게 답글 작성 중</span>
                    <button @click="cancelReply" class="btn-text-cancel">✖</button>
                </div>
                
                <div class="input-wrapper">
                    <input
                        id="newCommentInput"
                        v-model="newCommentContent"
                        placeholder="댓글을 작성하세요..."
                        class="rounded-input"
                        @keyup.enter="postComment"
                        autocomplete="off"
                    />
                    <button @click="postComment" class="btn-send-icon" :disabled="!newCommentContent.trim()">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div class="action-buttons">
        <button v-if="canSubmit" class="btn btn-primary" @click="submit">상신</button>
        <button v-if="canWithdraw" class="btn btn-secondary" @click="withdraw">회수</button>
        <button v-if="canApprove" class="btn btn-primary" @click="approve">승인</button>
        <button v-if="canReject" class="btn btn-danger" @click="showRejectModal = true">반려</button>
      </div>
    </section>

    <div v-else class="loading-message">
      문서 정보를 불러오는 중...
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="showRejectModal = false">
      <div class="modal-content">
        <h3>반려 사유 입력</h3>
        <textarea v-model="rejectReason" rows="5" placeholder="반려 사유를 입력해주세요."></textarea>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showRejectModal = false">취소</button>
          <button class="btn btn-danger" @click="reject">반려</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ApprovalLineDisplay from '@/components/approval/ApprovalLineDisplay.vue';
import ApprovalHistoryDisplay from '@/components/approval/ApprovalHistoryDisplay.vue';
import {
  fetchApprovalDetail,
  submitApproval,
  approveApproval,
  rejectApproval,
  withdrawApproval,
  addApprovalComment,
} from '@/api/approvalApi';
import { useAuthStore } from '@/stores/authStore'; // Assuming authStore is available for current user info

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const document = ref(null);
const showRejectModal = ref(false);
const rejectReason = ref('');

const docId = computed(() => route.params.docId);
const currentUserId = computed(() => authStore.user?.employeeId); // Assuming employeeId is the actorId

// References Expand Logic
const isReferencesExpanded = ref(false);
const visibleReferences = computed(() => {
    if (!document.value || !document.value.references) return [];
    if (isReferencesExpanded.value) return document.value.references;
    return document.value.references.slice(0, 5);
});

const fetchDocumentDetail = async () => {
  try {
    const response = await fetchApprovalDetail(docId.value);
    document.value = response.data.data;
    console.log('Document loaded:', document.value);
    console.log('Current User ID:', currentUserId.value);
    console.log('Document Writer ID:', document.value.writerId);
    console.log('Document Status:', document.value.status);
  } catch (error) {
    alert('문서 상세 정보를 불러오는 데 실패했습니다.');
    console.error('Failed to fetch approval detail:', error);
    document.value = null;
  }
};

const canSubmit = computed(() => {
  if (!document.value || !currentUserId.value) return false;
  const isDraft = document.value.status === 'DRAFT' || document.value.status === 'TEMP'; // Check for TEMP just in case
  const isOwner = Number(document.value.writerId) === Number(currentUserId.value);
  console.log('canSubmit check:', { status: document.value.status, writerId: document.value.writerId, currentUserId: currentUserId.value, isDraft, isOwner });
  return isDraft && isOwner;
});

const canWithdraw = computed(() => {
  if (!document.value || !currentUserId.value) return false;
  // Assuming the backend handles the specific logic for isWithdrawable
  // and the current user is the writer of the document
  // This is a simplified check, actual logic should be robust
  return (
    (document.value.status === 'IN_PROGRESS' || document.value.status === 'DRAFT') &&
     Number(document.value.writerId) === Number(currentUserId.value)
  );
});

const currentAccId = computed(() => authStore.user?.userId);

const canApprove = computed(() => {
  if (!document.value || !currentAccId.value) return false;
  // Check if current user is the PENDING approver in approvalSteps
  const currentStep = document.value.approvalSteps?.find(
    (step) => step.status === 'PENDING' && Number(step.approverId) === Number(currentAccId.value)
  );
  return document.value.status === 'IN_PROGRESS' && !!currentStep;
});

const canReject = computed(() => {
  if (!document.value || !currentAccId.value) return false;
  // Check if current user is the PENDING approver in approvalSteps
  const currentStep = document.value.approvalSteps?.find(
    (step) => step.status === 'PENDING' && Number(step.approverId) === Number(currentAccId.value)
  );
  return document.value.status === 'IN_PROGRESS' && !!currentStep;
});

// For Comments
const newCommentContent = ref('');
const replyToCommentId = ref(null);
const replyToCommentWriter = ref('');

const canAddComment = computed(() => {
  if (!document.value) return false;
  const status = document.value.status;
  return status !== 'DRAFT' && status !== 'WITHDRAWN';
});

const postComment = async () => {
  if (!newCommentContent.value.trim()) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }
  try {
    await addApprovalComment(
      docId.value,
      newCommentContent.value,
      replyToCommentId.value
    );
    newCommentContent.value = '';
    replyToCommentId.value = null;
    replyToCommentWriter.value = '';
    await fetchDocumentDetail(); // Refresh comments
    alert('댓글이 등록되었습니다.');
  } catch (error) {
    alert('댓글 등록에 실패했습니다.');
    console.error('Failed to post comment:', error);
  }
};

const replyTo = (comment) => {
  replyToCommentId.value = comment.commentId;
  replyToCommentWriter.value = comment.writerId;
  newCommentContent.value = `@${comment.writerId} `;
  // Focus on the comment input field
  const commentInput = window.document.getElementById('newCommentInput');
  if (commentInput) {
    commentInput.focus();
  }
};

const cancelReply = () => {
  replyToCommentId.value = null;
  replyToCommentWriter.value = '';
  newCommentContent.value = '';
};


const submit = async () => {
  if (!confirm('문서를 상신하시겠습니까?')) return;
  try {
    await submitApproval(docId.value);
    alert('문서가 상신되었습니다.');
    fetchDocumentDetail(); // Refresh document state
  } catch (error) {
    alert('문서 상신에 실패했습니다.');
    console.error('Failed to submit:', error);
  }
};

const approve = async () => {
  if (!confirm('문서를 승인하시겠습니까?')) return;
  try {
    await approveApproval(docId.value);
    alert('문서가 승인되었습니다.');
    fetchDocumentDetail(); // Refresh document state
  } catch (error) {
    alert('문서 승인에 실패했습니다.');
    console.error('Failed to approve:', error);
  }
};

const reject = async () => {
  if (!rejectReason.value.trim()) {
    alert('반려 사유를 입력해주세요.');
    return;
  }
  if (!confirm('문서를 반려하시겠습니까?')) return;
  try {
    await rejectApproval(docId.value, rejectReason.value);
    alert('문서가 반려되었습니다.');
    showRejectModal.value = false;
    rejectReason.value = '';
    fetchDocumentDetail(); // Refresh document state
  } catch (error) {
    alert('문서 반려에 실패했습니다.');
    console.error('Failed to reject:', error);
  }
};

const withdraw = async () => {
  if (!confirm('문서를 회수하시겠습니까?')) return;
  try {
    await withdrawApproval(docId.value);
    alert('문서가 회수되었습니다.');
    fetchDocumentDetail(); // Refresh document state
  } catch (error) {
    alert('문서 회수에 실패했습니다.');
    console.error('Failed to withdraw:', error);
  }
};

const formatDate = (datetime) => {
  if (!datetime) return '-';
  const date = new Date(datetime);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  if (docId.value) {
    fetchDocumentDetail();
  }
});
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 16px;
  font-family: 'Inter', sans-serif;
}

.section-title {
  margin-bottom: 20px;
}

.section-title h1 {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.approval-detail-card {
  margin-top: 20px;
}

/* Header Column Layout */
.detail-header-column {
    margin-bottom: 24px;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 20px;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.doc-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.header-meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 14px; /* Slightly smaller as requested */
  color: #6b7280;
}

.meta-label {
    font-weight: 500;
}

.meta-value {
    color: #374151;
    font-weight: 600;
}

.divider {
    color: #d1d5db;
    margin: 0 4px;
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

.btn-danger {
  background-color: #dc3545;
  color: #ffffff;
}

.btn-danger:hover {
  background-color: #c82333;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
}

.status-badge.draft { background-color: #ecf5ff; color: #3182f6; } /* Project Blue */
.status-badge.in_progress { background-color: #fff7ed; color: #c2410c; }
.status-badge.approved { background-color: #ecfdf5; color: #047857; }
.status-badge.rejected { background-color: #fef2f2; color: #b91c1c; }
.status-badge.withdrawn { background-color: #fffbeb; color: #b45309; }

.detail-content {
  margin-top: 24px;
}

.detail-content h3,
.approval-line h3,
.approval-history h3,
.approval-comments h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.detail-content p {
  font-size: 16px;
  line-height: 1.7;
  color: #1f2937;
  white-space: pre-wrap;
}

hr {
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 32px 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Comment specific styles */
.no-comments {
  color: #888;
  font-style: italic;
  padding: 10px 0;
}

.comment-list-container {
  margin-top: 15px;
}

.comment-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px 15px;
  margin-bottom: 10px;
  border-left: 4px solid #007bff; /* Primary color for comments */
}

.comment-item.is-reply {
  margin-left: 30px; /* Indent replies */
  border-left-color: #6c757d; /* Different color for replies */
  background-color: #eff3f7;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.comment-writer {
  font-weight: bold;
  color: #333;
  margin-right: 10px;
}

.comment-date {
  font-size: 12px;
  color: #777;
  margin-right: auto; /* Push reply button to the right */
}

.comment-content {
  font-size: 14px;
  color: #444;
  line-height: 1.5;
  white-space: pre-wrap;
}

.comment-input-area {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.comment-input-area h4 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.comment-input-area textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 10px;
}

.comment-input-area textarea:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 6px;
  margin-left: 8px;
}

.btn-reply {
  background-color: #6c757d;
  color: #fff;
}
.btn-reply:hover {
  background-color: #5a6268;
}

.reply-indicator {
  background-color: #e9ecef;
  border-left: 3px solid #007bff;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #495057;
}

.reply-indicator p {
  margin: 0;
}

.btn-cancel-reply {
  background-color: #dc3545;
  color: #fff;
}
.btn-cancel-reply:hover {
  background-color: #c82333;
}
</style>
