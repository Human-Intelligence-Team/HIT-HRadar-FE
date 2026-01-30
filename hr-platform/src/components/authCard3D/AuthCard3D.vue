<template>
  <div ref="cardEl" class="dual-card" @mousemove="onMove" @mouseleave="onLeave">
    <!-- LEFT -->
    <div class="panel left" @mouseenter="onEnterLeft">
      <div class="mini-badge">HRadar</div>
      <h2 class="title">Sign in</h2>
      <p class="sub">회사 코드를 발급받은 사용자</p>

      <ul class="chips">
        <li>Company Code</li>
        <li>ID</li>
        <li>Password</li>
      </ul>

      <button class="btn primary" type="button" @click="goLogin">
        로그인하기
      </button>
    </div>

    <!-- RIGHT -->
    <div class="panel right" @mouseenter="onEnterRight">
      <div class="mini-badge ghost">Start</div>
      <h2 class="title">Company Apply</h2>
      <p class="sub">신규 회사라면 신청 후 승인을 기다려요</p>

      <ul class="chips">
        <li>회사 정보</li>
        <li>담당자 정보</li>
        <li>사업자 정보</li>
      </ul>

      <button class="btn secondary" type="button" @click="goApply">
        회사 신청하기
      </button>
    </div>

    <!-- OVERLAY (snap: right <-> left) -->
    <div class="overlay" :class="{ left: side === 'LEFT' }">
      <div class="overlay-inner">
        <h3 class="overlay-title">
          {{ side === 'LEFT' ? 'Welcome Back' : 'Hello, Team' }}
        </h3>
        <p class="overlay-desc">
          {{ side === 'LEFT'
          ? '로그인해서 HRadar를 계속 사용하세요.'
          : '회사를 등록하고 HRadar를 시작하세요.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
// import { useRouter } from 'vue-router'

// const router = useRouter()
const cardEl = ref(null)

/** snap state */
const side = ref('RIGHT') // 기본: 오버레이가 오른쪽(회사신청) 덮음 -> 왼쪽 로그인 클릭 가능

const onEnterLeft = () => { side.value = 'RIGHT' } // 왼쪽 올라가면 오버레이는 오른쪽으로
const onEnterRight = () => { side.value = 'LEFT' } // 오른쪽 올라가면 오버레이는 왼쪽으로

/** subtle tilt (not blocking) */
let rafId = 0
const target = { rx: 0, ry: 0 }
const cur = { rx: 0, ry: 0 }
// const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

const applyVars = () => {
  const el = cardEl.value
  if (!el) return
  el.style.setProperty('--rx', `${cur.rx}deg`)
  el.style.setProperty('--ry', `${cur.ry}deg`)
}

const tick = () => {
  cur.rx += (target.rx - cur.rx) * 0.12
  cur.ry += (target.ry - cur.ry) * 0.12
  applyVars()
  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  applyVars()
  rafId = requestAnimationFrame(tick)
})

onBeforeUnmount(() => cancelAnimationFrame(rafId))

// 3D Mouse Move Logic Removed for now as requested
/*
const onMove = (e) => {
  const el = cardEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  // const x = clamp(e.clientX - rect.left, 0, rect.width)
  // const y = clamp(e.clientY - rect.top, 0, rect.height)

  target.ry = 0
  target.rx = 0
}
*/

const onMove = () => {} // No-op
const onLeave = () => {
  target.rx = 0
  target.ry = 0
}

const emit = defineEmits(['select-login', 'select-apply'])

const goLogin = () => emit('select-login')
const goApply = () => emit('select-apply')
</script>

<style scoped>
/* ============ card ============ */
.dual-card {
  --rx: 0deg;
  --ry: 0deg;

  width: min(860px, 92vw);
  height: 380px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-radius: 22px;

  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(12px);

  border: 1px solid transparent;
  background-image:
    linear-gradient(rgba(255,255,255,0.78), rgba(255,255,255,0.78)),
    linear-gradient(180deg, rgba(37,99,235,0.20), rgba(37,99,235,0.03));
  background-origin: border-box;
  background-clip: padding-box, border-box;

  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 22px 55px rgba(15, 23, 42, 0.16);

  transform-style: preserve-3d;
  transform: perspective(1100px) rotateX(var(--rx)) rotateY(var(--ry));
}

.dual-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 22px;
  background: radial-gradient(600px 220px at 30% 0%, rgba(255,255,255,0.55), transparent 60%);
  opacity: 0.6;
}

/* panels */
.panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  padding: 34px 34px 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  z-index: 1; /* overlay 아래/위는 overlay가 관리 */
}
.panel.left { left: 0; padding-right: 22px; }
.panel.right { right: 0; padding-left: 22px; }

.mini-badge {
  align-self: flex-start;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #1d4ed8;
  background: rgba(37, 99, 235, 0.10);
  border: 1px solid rgba(37, 99, 235, 0.18);
}
.mini-badge.ghost {
  color: #0f172a;
  background: rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(15, 23, 42, 0.10);
}

.title {
  margin: 12px 0 4px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #1e293b;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sub {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  line-height: 1.5;
  letter-spacing: -0.01em;
}

.chips {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chips li {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px 10px;
}



/* buttons */
.btn {
  height: 46px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.15s ease;
}
.btn:active { transform: translateY(1px); }

.btn.primary {
  border: none;
  color: #fff;
  background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow:
    0 10px 22px rgba(37, 99, 235, 0.22),
    0 2px 0 rgba(255, 255, 255, 0.18) inset;
}
.btn.primary:hover {
  transform: translateY(-1px);
  box-shadow:
    0 14px 26px rgba(37, 99, 235, 0.28),
    0 2px 0 rgba(255, 255, 255, 0.18) inset;
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.86);
  color: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.55);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
}
.btn.secondary:hover {
  background: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.10);
}

/* overlay (snap) */
.overlay {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 50%;
  width: calc(50% - 20px);

  border-radius: 20px;
  background: linear-gradient(180deg, rgba(37,99,235,0.96), rgba(29,78,216,0.96));
  box-shadow:
    0 16px 36px rgba(37, 99, 235, 0.28),
    0 2px 0 rgba(255, 255, 255, 0.20) inset;

  display: grid;
  place-items: center;

  /* ✅ 클릭 방해 방지 */
  pointer-events: none;

  /* ✅ 스냅 이동 */
  transform: translateX(0);
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* 오버레이가 왼쪽을 덮을 때 */
.overlay.left {
  transform: translateX(-100%);
}

.overlay-inner {
  width: 100%;
  padding: 0 28px;
  text-align: center;
  color: #fff;
}

.overlay-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.overlay-desc {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  opacity: 0.95;
  line-height: 1.6;
}

/* responsive */
@media (max-width: 820px) {
  .dual-card { height: auto; }
  .panel { position: relative; width: 100%; padding: 28px 22px; }
  .overlay { display: none; }
}
</style>
