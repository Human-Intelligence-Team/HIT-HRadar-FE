<template>
  <div class="page">
    <div class="section-title">
      <h1>결재 문서 상세</h1>
    </div>

    <section v-if="document" class="card approval-detail-card">
      <div class="detail-header">
        <h2>{{ document.title }}</h2>
        <span :class="['status-badge', document.status.toLowerCase()]">{{ document.status }}</span>
      </div>

      <div class="detail-meta">
        <p><strong>문서 유형:</strong> {{ document.docType }}</p>
        <p><strong>제출 일시:</strong> {{ formatDate(document.submittedAt) }}</p>
      </div>

      <div class="detail-content">
        <h3>본문</h3>
        <p>{{ document.content }}</p>
      </div>

      <hr />

      <ApprovalLineDisplay :steps="document.approvalSteps" />
      
      <div v-if="document.references && document.references.length > 0" class="approval-references">
        <h3>참조자</h3>
        <div class="reference-list">
          <span v-for="ref in document.references" :key="ref.referenceId" class="reference-item">
            {{ ref.referrerName }} ({{ ref.referrerId }})
          </span>
        </div>
      </div>

      <hr />

      <ApprovalHistoryDisplay :histories="document.histories" />

      <hr />

      <div class="approval-comments">
        <h3>댓글</h3>
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

        <div v-if="canAddComment" class="comment-input-area">
          <hr />
          <h4>새 댓글 추가</h4>
          <div v-if="replyToCommentId" class="reply-indicator">
            <p><strong>{{ replyToCommentWriter }}</strong> 님에게 답글 작성 중
              <button @click="cancelReply" class="btn-small btn-cancel-reply">취소</button>
            </p>
          </div>
          <textarea
            id="newCommentInput"
            v-model="newCommentContent"
            rows="3"
            placeholder="댓글을 입력하세요..."
            class="input-field"
          ></textarea>
          <div class="comment-actions">
            <button @click="postComment" class="btn btn-primary">등록</button>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <!-- Conditional rendering based on user role and document status -->
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
  const commentInput = document.value.getElementById('newCommentInput');
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

.approval-detail-card {
  margin-top: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.detail-header h2 {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
}

.status-badge.draft { background-color: #6c757d; } /* Grey */
.status-badge.in_progress { background-color: #007bff; } /* Blue */
.status-badge.approved { background-color: #28a745; } /* Green */
.status-badge.rejected { background-color: #dc3545; } /* Red */
.status-badge.withdrawn { background-color: #ffc107; color: #343a40; } /* Yellow */

.detail-meta p {
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
}

.detail-content {
  margin-top: 25px;
}

.detail-content h3,
.approval-line h3,
.approval-history h3,
.approval-comments h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.approval-references {
  margin-top: 30px;
}

.reference-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.reference-item {
  background-color: #f1f3f5;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  color: #495057;
}

.detail-content p {
  font-size: 16px;
  line-height: 1.6;
  color: #444;
  white-space: pre-wrap; /* Preserve whitespace and line breaks */
}

hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 30px 0;
}

.line-steps,
.history-list,
.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.line-steps li,
.history-list li,
.comment-list li {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #555;
}

.action-buttons {
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

.btn-danger {
  background-color: #dc3545;
  color: #ffffff;
}

.btn-danger:hover {
  background-color: #c82333;
}

.loading-message {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #777;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.modal-content textarea {
  width: 100%;
  min-height: 120px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 20px;
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
