<template>
  <div class="page-container">
    <div class="header">
      <h1 class="title">공지사항</h1>
      <button class="btn primary" @click="goToCreate">새 공지 작성</button>
    </div>

    <!-- Search and Filter Controls -->
    <div class="controls-container card">
      <div class="search-group">
        <label for="category-select">카테고리</label>
        <select id="category-select" v-model="categoryId" @change="handleFilterChange" class="form-select">
          <option value="">전체</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
      <div class="search-group">
        <label for="sort-select">정렬</label>
        <select id="sort-select" v-model="sortDir" @change="handleFilterChange" class="form-select">
          <option value="DESC">내림차순</option>
          <option value="ASC">오름차순</option>
        </select>
      </div>
      <div class="search-group keyword-group">
        <input
          type="text"
          v-model="keyword"
          placeholder="제목, 내용으로 검색"
          @keyup.enter="handleSearch"
          class="form-input"
        />
        <button @click="handleSearch" class="btn">검색</button>
      </div>
    </div>

    <div v-if="loading" class="loading-indicator">
      <p>Loading...</p>
    </div>

    <div v-else-if="!notices || notices.length === 0" class="no-data">
      <p>표시할 공지사항이 없습니다.</p>
    </div>

    <div v-else class="card-bd">
      <table class="table">
        <thead class="tbl-hd">
          <tr>
            <th style="width: 10%;">번호</th>
            <th style="width: 20%;">카테고리</th>
            <th style="width: 50%;">제목</th>
            <th style="width: 20%;">작성일</th>
          </tr>
        </thead>
        <tbody class="tbl-bd">
          <tr v-for="notice in notices" :key="notice.id" @click="goToDetail(notice.id)">
            <td>{{ notice.id }}</td>
            <td>
              <span class="category-badge">{{ notice.categoryName }}</span>
            </td>
            <td class="title-cell">{{ notice.title }}</td>
            <td>{{ formatDate(notice.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="page" class="pagination-container">
      <button @click="changePage(page.page - 1)" :disabled="page.page <= 1" class="btn page-btn">
        이전
      </button>
      <span class="page-info"> {{ page.page }} / {{ page.totalPages }} </span>
      <button @click="changePage(page.page + 1)" :disabled="page.page >= page.totalPages" class="btn page-btn">
        다음
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useNoticeStore } from '@/stores/noticeStore'
import { useRouter } from 'vue-router'

const store = useNoticeStore()
const router = useRouter()

// Computed properties from store
const notices = computed(() => store.data?.items)
const page = computed(() => store.data?.page)
const loading = computed(() => store.loading)
const searchCond = computed(() => store.searchCond)
const categories = computed(() => store.categories)

// Local state for UI controls
const keyword = ref(searchCond.value.keyword)
const categoryId = ref(searchCond.value.categoryId)
const sortDir = ref(searchCond.value.sortDir)

// Sync local state with store state
watch(searchCond, (newCond) => {
  keyword.value = newCond.keyword
  categoryId.value = newCond.categoryId
  sortDir.value = newCond.sortDir
})

// Fetch initial data on mount
onMounted(() => {
  store.fetchCategories()
  store.searchNotices(1)
})

function updateSearch() {
  store.setSearchCond({
    keyword: keyword.value,
    categoryId: categoryId.value,
    sortDir: sortDir.value,
  })
}

function handleSearch() {
  updateSearch()
}

function handleFilterChange() {
  updateSearch()
}

function changePage(newPage) {
  if (newPage > 0 && newPage <= page.value.totalPages) {
    store.searchNotices(newPage)
  }
}

function goToDetail(id) {
  router.push({ name: 'notice-detail', params: { id } })
}

function goToCreate() {
  router.push({ name: 'notice-create' })
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style scoped>
/* Global styles are used, with some local overrides and additions */
.page-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
}

.controls-container {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 15px;
  background-color: var(--background-color);
  border-radius: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-group label {
  font-weight: 500;
  color: var(--text-sub);
}

.keyword-group {
  margin-left: auto;
}

.form-select, .form-input {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background-color: var(--panel);
  color: var(--text-main);
}

.form-input {
  min-width: 250px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.tbl-hd {
  background-color: var(--panel);
  border-bottom: 1px solid var(--border);
}

.tbl-hd th {
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: var(--text-sub);
}

.tbl-bd tr {
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tbl-bd tr:hover {
  background-color: var(--primary-soft);
}

.tbl-bd td {
  padding: 12px 15px;
}

.title-cell {
  font-weight: 500;
}

.category-badge {
  background-color: var(--primary-soft);
  color: var(--primary);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}


.loading-indicator,
.no-data {
  text-align: center;
  padding: 40px;
  color: var(--text-sub);
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.page-btn {
  margin: 0 5px;
}

.page-info {
  font-weight: 500;
  margin: 0 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  background-color: var(--primary-soft);
  color: var(--text-main);
  transition: background-color 0.2s ease;
}

.btn:hover {
    background-color: var(--primary);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.primary {
  background-color: var(--primary);
  color: var(--text-on-primary);
}
.btn.primary:hover {
    background-color: var(--primary-dark);
}
</style>