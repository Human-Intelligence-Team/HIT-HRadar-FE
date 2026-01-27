<template>
  <section class="approval-create-view">
    <!-- 타이틀 + 액션 버튼 -->
    <div class="section-title">
      <div>
        <h1>결재 문서 작성</h1>
        <div class="sub">새로운 결재 문서를 작성합니다.</div>
      </div>
      <div class="actions">
        <button class="btn">취소</button>
        <button class="btn secondary">임시저장</button>
        <button class="btn primary">등록</button>
      </div>
    </div>

    <!-- 컨텐츠 영역 -->
    <div class="content-wrapper">
      <!-- 상단 정보: 기안자, 결재선, 참조자 -->
      <div class="info-grid">
        <!-- 기안자 -->
        <div class="info-box">
          <div class="box-title">기안자</div>
          <div class="box-content">
            <div class="info-row">
              <span class="label">부서</span>
              <span class="value">인사 1팀</span>
            </div>
            <div class="info-row">
              <span class="label">이름</span>
              <span class="value">이상도</span>
            </div>
            <div class="info-row">
              <span class="label">직급</span>
              <span class="value">부장</span>
            </div>
            <div class="info-row">
              <span class="label">기안일</span>
              <span class="value">2026-01-08</span>
            </div>
          </div>
        </div>

        <!-- 결재선 -->
        <div class="info-box">
          <div class="box-title">결재선</div>
          <div class="box-content">
            <div class="approval-line">
              <div class="approver">
                <span class="label">1차</span>
                <span class="value">성원재 (대리·유관부)</span>
              </div>
              <div class="approver">
                <span class="label">2차</span>
                <div class="input-group">
                  <input placeholder="선택" class="small-input" />
                  <button class="btn-select">선택</button>
                </div>
              </div>
              <div class="approver">
                <span class="label">3차</span>
                <div class="input-group">
                  <input placeholder="선택" class="small-input" />
                  <button class="btn-select">선택</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 참조자 -->
        <div class="info-box">
          <div class="box-title">참조자 *</div>
          <div class="box-content">
            <div class="ref-line">
              <div class="input-group">
                <input placeholder="선택" class="small-input" />
                <button class="btn-select">선택</button>
              </div>
              <div class="input-group">
                <input placeholder="선택" class="small-input" />
                <button class="btn-select">선택</button>
              </div>
              <div class="input-group">
                <input placeholder="선택" class="small-input" />
                <button class="btn-select">선택</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단: 결재 내용 -->
      <div class="form-section">
        <div class="box-title">결재 내용</div>
        <div class="form-body">
            <div class="form-grid">
                <div class="field">
                    <label>결재유형 *</label>
                    <select class="select">그럼
                    <option>근태 정정</option>
                    </select>
                </div>
                <div class="field">
                    <label>변경 일자 *</label>
                    <input type="date" class="input" />
                </div>
                <div class="field">
                    <label>기존 시간 *</label>
                    <input type="time" class="input" />
                </div>
                <div class="field">
                    <label>변경 시간 *</label>
                    <input type="time" class="input" />
                </div>
            </div>
            <div class="field full-width">
                <label>제목 *</label>
                <input class="input" />
            </div>
            <div class="field full-width">
                <label>내용</label>
                <textarea class="textarea"></textarea>
            </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// 스크립트 영역은 비워둠
</script>

<style scoped>
/* ===== 전체 레이아웃 ===== */
.approval-create-view {
  overflow-y: auto; /* 전체 스크롤 */
  padding-right: 12px;
  height: calc(100vh - 56px); /* 헤더 높이만큼 빼기 */
}

/* ===== 헤더 ===== */
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}
.section-title h1 {
  font-size: 18px;
  font-weight: 700;
}
.section-title .sub {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

/* ===== 액션 버튼 ===== */
.actions {
  display: flex;
  gap: 8px;
}
.btn {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  cursor: pointer;
}
.btn.secondary {
  background-color: #f3f4f6;
}
.btn.primary {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

/* ===== 메인 컨텐츠 ===== */
.content-wrapper {
  background-color: var(--card, #ffffff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 14px;
  padding: 20px;
  box-shadow: none; /* 그림자 제거 */
}

/* ===== 상단 정보 그리드 ===== */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1.5fr;
  gap: 20px;
  margin-bottom: 24px;
}

.info-box {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}

.box-title {
  font-size: 14px;
  font-weight: 600;
  padding: 10px 14px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.box-content {
  padding: 14px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 기안자 정보 */
.info-row {
  display: flex;
  font-size: 13px;
  padding: 6px 0;
  align-items: center;
}
.info-row .label {
  width: 60px;
  color: #6b7280;
  font-weight: 500;
}
.info-row .value {
  color: #111827;
}

/* 결재선 & 참조자 */
.approval-line, .ref-line {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.approver {
  display: grid;
  grid-template-columns: 40px 1fr;
  align-items: center;
  font-size: 13px;
  gap: 8px;
}
.approver .label {
  font-weight: 500;
  color: #374151;
}
.approver .value {
  padding: 8px 10px;
  background-color: #f3f4f6;
  border-radius: 6px;
  font-size: 13px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.small-input {
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.btn-select {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 6px;
  background-color: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
  cursor: pointer;
  flex-shrink: 0;
}
.btn-select:hover {
  background-color: #d1d5db;
}

/* ===== 하단 폼 섹션 ===== */
.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden; /* 자식 요소의 radius 적용을 위해 */
}
.form-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.input, .select, .textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #ffffff;
}

.textarea {
  min-height: 120px;
  resize: vertical;
}

</style>
