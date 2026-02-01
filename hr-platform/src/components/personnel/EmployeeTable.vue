<template>
  <div class="table-container">
    <table class="modern-table">
      <thead>
        <tr>
          <th width="60"></th> <!-- Avatar -->
          <th width="100">사번</th>
          <th>사원 정보</th>
          <th>부서</th>
          <th>직위</th>
          <th class="text-center" width="80">상태</th>
          <th>연락처</th>
          <th v-if="isAdmin" width="180" class="text-center" style="padding-left: 55px">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="emp in employees" 
          :key="emp.empId || emp.userId" 
          class="hover-row clickable-row"
          @click="$emit('view', emp)"
        >
          <!-- Avatar -->
          <td class="text-center">
             <div class="avatar-circle">
               <i class="pi pi-user"></i>
             </div>
          </td>
          
          <!-- Employee No -->
          <td>
             <span class="emp-no-text">{{ emp.employeeNo || emp.empNo || '-' }}</span>
          </td>

          <!-- Name & ID -->
          <td>
            <div class="emp-identity">
              <span class="emp-name">{{ emp.name }}</span>
              <span class="emp-email">{{ emp.email || emp.loginId || '-' }}</span>
              <!-- Fallback ID if needed: <span class="emp-id-sub">{{ emp.employeeNo }}</span> -->
            </div>
          </td>

          <!-- Department (Try nested field first, then Map Lookup) -->
          <td>
            <div class="dept-info">
               <span class="dept-text">
                 {{ emp.department?.deptName || deptMap[emp.deptId] || emp.deptName || '-' }}
               </span>
            </div>
          </td>

          <!-- Position -->
          <td>
            <span class="badge position-badge">
              {{ emp.position?.posName || posMap[emp.positionId] || emp.posName || '-' }}
            </span>
          </td>

          <!-- Status -->
          <td class="text-center">
             <span :class="['status-badge', (emp.status === 'RESIGNED' ? 'resigned' : 'active')]">
               {{ emp.status === 'RESIGNED' ? '퇴직' : '재직' }}
             </span>
          </td>

          <!-- Contact (Phone) -->
          <td>
             <span class="text-sub">{{ emp.phoneNo || emp.phone || '-' }}</span>
          </td>

          <!-- Actions -->
          <td v-if="isAdmin" class="text-center action-cell" @click.stop>
             <div class="action-buttons centered">
                <!-- Edit -->
                <button class="btn-action edit" @click.stop="$emit('edit', emp)">
                  <span>수정</span>
                </button>
                <!-- Delete -->
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

/* Avatar */
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

/* Identity */
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

/* Position Badge */
.position-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: #ecfdf5;
  color: #059669; /* Emerald */
}

/* Actions */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Modern Action Buttons */
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
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #94a3b8;
  font-size: 14px;
}
</style>
