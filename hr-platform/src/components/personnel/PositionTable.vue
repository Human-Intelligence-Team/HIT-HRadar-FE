<template>
  <div class="table-card">
    <div class="card-header">
      <div class="header-text">
        <h2 class="card-title">직위 목록</h2>
        <span class="badge-count">{{ positions.length }}</span>
      </div>
      
      <button v-if="isAdmin" class="btn-create" @click="$emit('add')">
        <span class="icon-wrapper">
          <i class="pi pi-plus"></i>
        </span>
        <span class="btn-text">새 직위 등록</span>
      </button>
    </div>

    <div class="table-responsive">
      <table class="modern-table">
        <thead>
          <tr>
            <th width="100">서열 순위</th>
            <th>직위명</th>
            <th v-if="isAdmin" width="120" class="text-right">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pos in positions" :key="pos.positionId" class="hover-row">
            <td>
              <div class="rank-circle">{{ pos.rank }}</div>
            </td>
            <td>
              <span class="pos-name">{{ pos.name }}</span>
            </td>
            <td v-if="isAdmin">
              <div class="action-buttons">
                <button class="btn-icon edit" @click="$emit('edit', pos)">
                  <i class="pi pi-pencil"></i>
                  <span>수정</span>
                </button>
                <button class="btn-icon delete" @click="$emit('delete', pos.positionId)">
                  <i class="pi pi-trash"></i>
                  <span>삭제</span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="positions.length === 0">
            <td :colspan="isAdmin ? 3 : 2" class="empty-state">
              <div class="empty-content">
                <i class="pi pi-inbox empty-icon"></i>
                <p>등록된 직위가 없습니다.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  positions: {
    type: Array,
    default: () => []
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

defineEmits(['add', 'edit', 'delete'])
</script>

<style scoped>
.table-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid #f3f4f6;
}

.card-header {
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  background: #ffffff;
}

.header-text {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.badge-count {
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
}

/* Premium Button Styling */
.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 10px 20px 10px 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.btn-create:active {
  transform: translateY(0);
}

.icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.icon-wrapper i {
  font-size: 12px;
  font-weight: bold;
}

/* Modern Table Styling */
.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  text-align: left;
  padding: 16px 32px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  background: #f9fafb;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modern-table td {
  padding: 20px 32px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  vertical-align: middle;
}

.modern-table tr:last-child td {
  border-bottom: none;
}

.hover-row {
  transition: background-color 0.2s ease;
}

.hover-row:hover {
  background-color: #f8fafc;
}

.rank-circle {
  width: 32px;
  height: 32px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  font-family: var(--font-mono, monospace);
}

.pos-name {
  font-weight: 600;
  font-size: 15px;
  color: #111827;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-icon {
  height: 36px;
  padding: 0 12px; /* Add padding for text */
  border-radius: 10px;
  border: none;
  background: #f3f4f6;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px; /* Space between icon and text */
  transition: all 0.2s;
  font-size: 13px; /* Text size */
  font-weight: 500;
}

.btn-icon:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-icon.edit {
  background: #eff6ff;
  color: #3b82f6;
}
.btn-icon.edit:hover {
  background: #dbeafe;
  color: #2563eb;
}

.btn-icon.delete {
  background: #fef2f2;
  color: #ef4444;
}
.btn-icon.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

.text-right {
  text-align: right;
}

.empty-state {
  padding: 80px 0;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  color: #e5e7eb;
}
</style>
