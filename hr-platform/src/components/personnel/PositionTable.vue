<template>
  <div class="card">
    <div class="card-hd">
      <div>
        <h2>직위 목록</h2>
        <div class="desc">회사의 직위 체계와 서열을 관리합니다.</div>
      </div>
      <button v-if="isAdmin" class="btn primary" @click="$emit('add')">
        + 직위 추가
      </button>
    </div>

    <div class="card-bd">
      <table class="table">
        <thead>
          <tr>
            <th style="width: 80px">순위</th>
            <th>직위명</th>
            <th v-if="isAdmin" style="width: 120px" class="text-right">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pos in positions" :key="pos.positionId">
            <td><b class="rank-num">{{ pos.rank }}</b></td>
            <td><span class="pos-name">{{ pos.name }}</span></td>
            <td v-if="isAdmin" class="text-right">
              <div class="action-btns">
                <button class="btn-icon" title="수정" @click="$emit('edit', pos)">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="btn-icon danger" title="삭제" @click="$emit('delete', pos.positionId)">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="positions.length === 0">
            <td :colspan="isAdmin ? 3 : 2" class="text-center py-8">
              <div class="empty-msg">등록된 직위가 없습니다.</div>
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
.rank-num {
  color: var(--primary);
  font-family: var(--font-mono, monospace);
}
.pos-name {
  font-weight: 600;
  color: var(--text-main);
}
.text-right { text-align: right; }
.text-center { text-align: center; }
.py-8 { padding: 40px 0; }

.action-btns {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,.03);
  color: var(--text-sub);
  cursor: pointer;
  transition: var(--transition-fast);
}
.btn-icon:hover {
  background: rgba(255,255,255,.08);
  color: var(--text-main);
  border-color: var(--primary);
}
.btn-icon.danger:hover {
  background: rgba(251,113,133,.1);
  color: var(--bad);
  border-color: var(--bad);
}

.empty-msg {
  color: var(--text-muted);
  font-size: 13px;
}

/* Ensure PrimeIcons are available or use text fallback if needed */
.pi { font-size: 14px; }
</style>
