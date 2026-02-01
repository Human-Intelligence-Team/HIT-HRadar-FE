<template>
  <div class="table-container">
    <table class="modern-table">
      <thead>
        <tr>
          <th width="60"></th> <!-- 아바타 -->
          <th width="100">사번</th>
          <th>사원 정보</th>
          <th>부서</th>
          <th>직위</th>
          <th>역할</th>
          <th class="text-center" width="80">상태</th>
          <th>연락처</th>
          <th v-if="isAdmin" width="240" class="text-center" style="padding-left: 55px">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="emp in employees" 
          :key="emp.empId || emp.userId" 
          class="hover-row clickable-row"
          @click="$emit('view', emp)"
        >
          <!-- 아바타 -->
          <td class="text-center">
             <div class="avatar-circle">
               <i class="pi pi-user"></i>
             </div>
          </td>
          
          <!-- 사번 -->
          <td>
             <span class="emp-no-text">{{ emp.employeeNo || emp.empNo || '-' }}</span>
          </td>

          <!-- 이름 & ID -->
          <td>
            <div class="emp-identity">
              <span class="emp-name">{{ emp.name }}</span>
              <span class="emp-email">{{ emp.email || emp.loginId || '-' }}</span>
            </div>
          </td>

          <!-- 부서 -->
          <td>
            <div class="dept-info">
               <span class="dept-text">
                 {{ emp.department?.deptName || deptMap[emp.deptId] || emp.deptName || '-' }}
               </span>
            </div>
          </td>

          <!-- 직위 -->
          <td>
            <span class="badge position-badge">
              {{ emp.position?.posName || posMap[emp.positionId] || emp.posName || '-' }}
            </span>
          </td>

          <!-- 역할 -->
          <td>
            <div class="roles-tags">
                <span v-for="role in (emp.roles || [])" :key="role" class="role-tag">{{ role }}</span>
                <span v-if="(!emp.roles || emp.roles.length === 0)" class="text-sub">-</span>
            </div>
          </td>

          <!-- 상태 -->
          <td class="text-center">
             <span :class="['status-badge', (emp.status === 'RESIGNED' ? 'resigned' : 'active')]">
               {{ emp.status === 'RESIGNED' ? '퇴직' : '재직' }}
             </span>
          </td>

          <!-- 연락처 -->
          <td>
             <span class="text-sub">{{ emp.phoneNo || emp.phone || '-' }}</span>
          </td>

          <!-- 관리 기능 -->
          <td v-if="isAdmin" class="text-center action-cell" @click.stop>
             <div class="action-buttons centered">
                <!-- 역할 배정 -->
                <button class="btn-action role" @click.stop="$emit('role', emp)" title="역할 부여">
                  <i class="pi pi-shield"></i>
                  <span>역할</span>
                </button>
                <!-- 수정 -->
                <button class="btn-action edit" @click.stop="$emit('edit', emp)">
                  <span>수정</span>
                </button>
                <!-- 삭제 -->
                <button class="btn-action delete" @click.stop="$emit('delete', emp)">
                  <span>삭제</span>
                </button>
             </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  employees: {
    type: Array,
    default: () => []
  },
  deptMap: {
    type: Object,
    default: () => ({})
  },
  posMap: { 
    type: Object,
    default: () => ({})
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

defineEmits(['appointment', 'history', 'edit', 'delete', 'view'])
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid var(--border);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.modern-table th {
  padding: 16px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.modern-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  transition: background 0.2s;
}

.hover-row:hover td {
  background: #f8fafc;
}
.clickable-row {
  cursor: pointer;
}

.divider-vertical {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  margin: 0 4px;
}

/* 아바타 */
.avatar-circle {
  width: 36px; height: 36px;
  background: #e0e7ff;
  color: #4f46e5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* 사원 정보 */
.emp-identity {
  display: flex;
  flex-direction: column;
}
.emp-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.emp-email {
  font-size: 12px;
  color: #94a3b8;
}

.emp-no-text {
  font-family: monospace;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.5px;
}

/* 직위 배지 */
.position-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: #ecfdf5;
  color: #059669; /* Emerald */
}

/* 액션 버튼 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 모던 액션 버튼 스타일 */
.btn-action {
  display: flex;
  align-items: center;
  justify-content: center; /* Center content */
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
/*.btn-action span { ... }  Removed hacks */

.btn-action.edit {
  color: #3b82f6;
  background: #eff6ff;
  border-color: #dbeafe;
}
.btn-action.edit:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-action.delete {
  color: #ef4444;
  background: #fef2f2;
  border-color: #fee2e2;
}
.btn-action.delete:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}
.status-badge.active { background: #dcfce7; color: #15803d; }
.status-badge.resigned { background: #f1f5f9; color: #64748b; }

.action-buttons.centered {
  justify-content: center;
  margin-right: 42px; /* Even more nudge left */
}

.empty-cell {
  text-align: center;
  padding: 60px;
}
.roles-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.role-tag { font-size: 11px; background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; }

.btn-action.role {
  color: #8b5cf6;
  background: #f5f3ff;
  border-color: #ede9fe;
}
.btn-action.role:hover {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #94a3b8;
  font-size: 14px;
}
</style>
