<template>
  <div ref="cardEl" class="three-d-card" @mousemove="onMove" @mouseleave="onLeave">
    <div class="card-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const cardEl = ref(null)

/* ----------------------
 * 3D Tilt Logic
 * ---------------------- */
let rafId = 0
const target = { rx: 0, ry: 0 }
const cur = { rx: 0, ry: 0 }
// 3D logic simplified

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

// 3D Motion Disabled
const onMove = () => {
  // logic removed to fix unused vars
  target.ry = 0
  target.rx = 0
}

const onLeave = () => {
  target.rx = 0
  target.ry = 0
}
</script>

<style scoped>
.three-d-card {
  --rx: 0deg;
  --ry: 0deg;

  width: min(420px, 92vw);
  height: auto;
  min-height: 520px;
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
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.three-d-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 22px;
  background: radial-gradient(600px 220px at 30% 0%, rgba(255,255,255,0.55), transparent 60%);
  opacity: 0.6;
}

.card-content {
  width: 100%;
  z-index: 2;
  /* Just a container for slot */
}
</style>
