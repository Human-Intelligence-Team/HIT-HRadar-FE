<template>
  <section>
    <div class="section-title">
      <div>
        <h1>회사 정보 조회</h1>
        <div class="sub">내가 소속된 회사의 기본 정보를 확인합니다.</div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">데이터를 불러오는 중...</div>

    <div v-else-if="company" class="company-detail">
      <div class="grid cols-1">
        <!-- Basic Info Card -->
        <BaseCard>
          <div class="card-hd">
            <h2>기본 정보</h2>
          </div>
          <div class="card-bd info-list">
            <div class="info-item full-width">
              <span class="label">회사명</span>
              <span class="value" style="font-size: 18px;">{{ company.companyName }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">주소</span>
              <span class="value">{{ company.address || '-' }}</span>
            </div>
            
            <div class="info-item">
              <span class="label">회사코드</span>
              <span class="value font-mono">{{ company.comCode || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">대표자명</span>
              <span class="value">{{ company.ceoName || '-' }}</span>
            </div>
            
            <div class="info-item">
              <span class="label">설립일</span>
              <span class="value">{{ company.foundDate || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">사업자 등록번호</span>
              <span class="value">{{ company.bizNo || '-' }}</span>
            </div>

            <div class="info-item">
              <span class="label">대표 전화</span>
              <span class="value">{{ company.comTel || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">이메일</span>
              <span class="value">{{ company.comEmail || '-' }}</span>
            </div>

            <div class="info-item full-width">
              <span class="label">상태</span>
              <span class="value">
                <span class="badge good" v-if="!company.isDeleted || company.isDeleted === 'N'">
                  <span class="dot"></span> 정상
                </span>
                <span class="badge bad" v-else>
                  <span class="dot"></span> 정지
                </span>
              </span>
            </div>
          </div>
        </BaseCard>
      </div>

    </div>

    <div v-else class="empty-state">
      <i class="pi pi-exclamation-circle"></i>
      <p>회사 정보를 불러올 수 없습니다.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import { fetchMyCompany } from '@/api/companyApi'

const company = ref(null)
const loading = ref(false)

const loadCompany = async () => {
  loading.value = true
  try {
    const res = await fetchMyCompany()
    company.value = res.data?.data
  } catch (e) {
    console.error('Failed to load company info', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadCompany)
</script>


<style scoped>
.info-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 Columns */
  gap: 0; /* Remove gap to connect borders */
  border-top: 1px solid var(--border); /* Top border for the list */
}

.info-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  min-height: 48px; /* Taller rows for table look */
  padding: 0 16px; /* Horizontal padding */
  border-bottom: 1px solid var(--border); /* Bottom border for each cell */
}

.info-item.full-width {
  grid-column: span 2; /* Full width */
}

.label {
  font-size: 13px;
  color: var(--text-sub);
  min-width: 120px; /* Fixed width */
  flex-shrink: 0;
}

.value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
  word-break: break-all;
}
.font-mono {
  font-family: var(--font-mono, monospace);
  letter-spacing: 0px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 80px;
  color: var(--text-muted);
  background: var(--card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
.empty-state i {
  font-size: 32px;
  margin-bottom: 12px;
}
</style>
