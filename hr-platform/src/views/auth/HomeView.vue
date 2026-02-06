<template>
  <main class="page">
    <!-- Background Elements -->
    <div class="bg-layer gradient-bg" />
    <div class="bg-layer noise-bg" />

    <!-- Navigation -->
    <header class="nav" :class="{ scrolled: isScrolled }">
      <div class="container nav-inner">
        <div class="brand">
          <BrandLogo size="32" class="logo-mark" />
          <span class="logo-text">HRADAR</span>
        </div>
        <nav class="nav-links">
          <a href="#problems" @click.prevent="scrollTo('#problems')">Why</a>
          <a href="#goal" @click.prevent="scrollTo('#goal')">Goal</a>
          <a href="#features" @click.prevent="scrollTo('#features')">Features</a>
        </nav>
        <div class="nav-actions">
          <button class="btn-text" @click="goToGateway">로그인</button>
          <button class="btn-primary" @click="switchToApply">도입 신청</button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container hero-content">
        <div class="hero-text" data-aos>
          <div class="kicker">HR 의사결정 인텔리전스</div>
          <h1 class="hero-title">
            데이터는 충분하지만,<br />
            <span class="text-highlight">판단 가능한 형태</span>는 아닙니다.
          </h1>
          <p class="hero-desc">
            근태·성과·프로젝트·피드백을 하나의 맥락(Context)으로 통합하고,<br />
            HR이 공정함을 <strong>설명 가능한 근거</strong>로 바꿉니다.
          </p>
          <!-- Button removed as per request (Only Top & Bottom) -->
          <p class="hero-note">⚠️ AI는 결정을 내리지 않습니다. 최종 판단은 HR이 합니다.</p>
        </div>
        <div class="hero-visual" data-aos>
          <!-- Dashboard Mockup -->
          <div class="app-mockup">
            <div class="mock-sidebar">
              <div class="side-item active"></div>
              <div class="side-item"></div>
              <div class="side-item"></div>
            </div>
            <div class="mock-main">
              <div class="mock-top-bar"></div>
              <div class="mock-content-grid">
                <div class="glass-card main-card">
                  <div class="card-header">
                    <div class="avatar-group">
                      <span class="avatar"></span>
                      <div class="user-info">
                        <div class="name-bar"></div>
                        <div class="role-bar"></div>
                      </div>
                    </div>
                    <div class="status-badge warning">Burnout Risk</div>
                  </div>
                  <div class="radar-chart-mock">
                    <svg viewBox="0 0 100 100" class="radar-svg">
                      <polygon points="50,10 90,40 70,90 30,90 10,40" class="radar-grid" />
                      <polygon points="50,25 75,43.75 62.5,75 37.5,75 25,43.75" class="radar-grid inner" />
                      <polygon points="50,40 60,47.5 55,60 45,60 40,47.5" class="radar-grid inner" />
                      <line x1="50" y1="50" x2="50" y2="10" class="radar-axis" />
                      <line x1="50" y1="50" x2="90" y2="40" class="radar-axis" />
                      <line x1="50" y1="50" x2="70" y2="90" class="radar-axis" />
                      <line x1="50" y1="50" x2="30" y2="90" class="radar-axis" />
                      <line x1="50" y1="50" x2="10" y2="40" class="radar-axis" />
                      <polygon points="50,20 80,45 65,80 35,80 20,45" class="radar-val" />
                      <circle cx="50" cy="20" r="1.5" class="radar-dot" />
                      <circle cx="80" cy="45" r="1.5" class="radar-dot" />
                      <circle cx="65" cy="80" r="1.5" class="radar-dot" />
                      <circle cx="35" cy="80" r="1.5" class="radar-dot" />
                      <circle cx="20" cy="45" r="1.5" class="radar-dot" />
                    </svg>
                  </div>
                  <div class="insight-row">
                    <div class="icon-box">⚡</div>
                    <div class="text-box">
                      <div class="l1">최근 야근 급증 + 협업 지수 하락</div>
                      <div class="l2">면담이 필요한 시점입니다.</div>
                    </div>
                  </div>
                </div>
                <div class="small-cards">
                  <div class="glass-card stat-card">
                    <div class="stat-val">82%</div>
                    <div class="stat-lab">협업 만족도</div>
                  </div>
                  <div class="glass-card stat-card">
                    <div class="stat-val">B+</div>
                    <div class="stat-lab">성과 예측</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Floating decorative cards -->
          <div class="glass-card float-card c1">
            <div class="stat-num">94%</div>
            <div class="stat-label">Data Accuracy</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 1. Background & Problems -->
    <section id="problems" class="section problem-section">
      <div class="container">
        <div class="section-header center" data-aos>
          <span class="section-tag">BACKGROUND & PROBLEM</span>
          <h2>왜 지금의 인사 데이터는<br />의사결정을 돕지 못할까요?</h2>
        </div>

        <div class="problem-grid">
          <div class="p-card" data-aos>
            <div class="p-icon">🧩</div>
            <h3>인사 데이터의 파편화</h3>
            <p>
              근태, 성과, 프로젝트, 상담 기록이 각기 다른 시스템에 흩어져 있습니다.
              하나의 <strong>'맥락(Context)'</strong>으로 연결되지 않아 종합적인 판단이 불가능합니다.
            </p>
          </div>
          <div class="p-card" data-aos>
            <div class="p-icon">📉</div>
            <h3>평가 공정성 불신</h3>
            <p>
              정성 평가에 대한 불신과 피드백 부재는 구성원의 신뢰를 떨어뜨립니다.
              전통적인 연말 평가는 시의성이 떨어져 <strong>'사후 통보'</strong>에 그칩니다.
            </p>
          </div>
          <div class="p-card" data-aos>
            <div class="p-icon">⚠️</div>
            <h3>사후 대처의 한계</h3>
            <p>
              핵심 인재의 이탈이나 번아웃을 이미 벌어진 뒤에야 알게 됩니다.
              <strong>예방적 관리 체계</strong>가 없어 HR은 늘 문제 해결에 급급합니다.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Goal -->
    <section id="goal" class="section goal-section">
      <div class="container">
        <div class="goal-box" data-aos>
          <div class="goal-content">
            <h2 class="goal-title">PROJECT GOAL</h2>
            <p class="goal-main">
              단순한 시스템 구축이 아닙니다.<br />
              HR 담당자가 <strong>"공정한 판단이었다"</strong>고<br />
              설명할 수 있는 근거를 만듭니다.
            </p>
            <div class="goal-sub">
              <div class="item">
                <span class="check">✔</span> 정량(성과/근태) + 정성(피드백/상담) 통합
              </div>
              <div class="item">
                <span class="check">✔</span> 변화 신호 감지 및 시각화
              </div>
              <div class="item">
                <span class="check">✔</span> <strong>HR의 의사결정 인텔리전스</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Features -->
    <section id="features" class="section feature-section">
      <div class="container">
        <div class="section-header" data-aos>
          <span class="section-tag">CORE FUNCTIONS</span>
          <h2>데이터가 흐름이 되는<br />HRADAR 핵심 기능</h2>
        </div>

        <!-- Feature 1 -->
        <div class="feature-row" data-aos>
          <div class="f-text">
            <div class="f-num">01</div>
            <h3>AI 기반 개인 인사 리포트</h3>
            <p class="f-desc">
              직원의 현재 상태와 변화 신호를 한눈에 파악하세요.
              평가 시즌, 면담 전, 인재 리뷰 시 가장 강력한 도구가 됩니다.
            </p>
            <ul class="f-list">
              <li><strong>다면적 협업 지수</strong>: 동료 피드백 기반의 다각도 역량 시각화</li>
              <li><strong>직무 만족도 분석</strong>: 업무 환경 및 성장 관점의 종합 진단</li>
              <li><strong>AI 분석 가이드</strong>: "번아웃 위험", "성과 정체" 등 맞춤형 인사이트</li>
            </ul>
          </div>
          <div class="f-visual">
            <div class="app-mockup mini">
              <div class="mock-sidebar slim"></div>
              <div class="mock-main">
                <div class="mock-top-bar small"></div>
                <div class="mock-body">
                  <div class="profile-summary">
                    <div class="avatar-circle"></div>
                    <div class="text-lines">
                      <div class="line w60"></div>
                      <div class="line w40"></div>
                    </div>
                  </div>
                  <div class="chart-area-mock">
                    <div class="radar-svg-small"></div>
                  </div>
                  <div class="segment-tag">🔴 이탈 위험 감지 (Burnout)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature 2 -->
        <div class="feature-row reverse" data-aos>
          <div class="f-text">
            <div class="f-num">02</div>
            <h3>HR 기준 조정형 데이터 분석</h3>
            <p class="f-desc">
              분석의 기준은 AI가 정하지 않습니다.
              우리 회사의 상황에 맞춰 HR 담당자가 직접 임계값을 조정하고 시뮬레이션합니다.
            </p>
            <ul class="f-list">
              <li>성과 구간, 근태 기준, 감지 민감도 직접 설정</li>
              <li>기준 변경 시 <strong>실시간 통계 재계산</strong></li>
              <li>조직 → 본부 → 팀 → 개인 단위 드릴다운 분석</li>
            </ul>
          </div>
          <div class="f-visual">
            <div class="app-mockup mini">
              <div class="mock-sidebar slim"></div>
              <div class="mock-main">
                <div class="mock-top-bar small"></div>
                <div class="admin-dashboard-mock">
                  <div class="grid-2x2">
                    <div class="mini-card"><div class="bar-chart-lines"></div></div>
                    <div class="mini-card"><div class="gauge-half"></div></div>
                    <div class="mini-card"><div class="line-graph"></div></div>
                    <div class="mini-card"><div class="stack-bars"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature 3 -->
        <div class="feature-row" data-aos>
          <div class="f-text">
            <div class="f-num">03</div>
            <h3>분기별 성장 로드맵</h3>
            <p class="f-desc">
              평가는 끝이 아니라 성장의 시작이어야 합니다.
              이전 분기 대비 변화를 추적하고 맞춤형 성장 계획을 수립합니다.
            </p>
            <ul class="f-list">
              <li>HR 개입(면담, 교육) 전후 변화 효과 분석</li>
              <li>개인별 맞춤 추천 액션 및 목표 설정</li>
              <li>"평가했다"가 아닌 <strong>"성장시켰다"</strong>는 증명</li>
            </ul>
          </div>
          <div class="f-visual">
            <div class="screen-mockup">
              <div class="timeline">
                <div class="t-node">1Q 진단</div>
                <div class="t-line"></div>
                <div class="t-node active">2Q Action</div>
                <div class="t-line"></div>
                <div class="t-node">3Q 목표</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Differentiation -->
    <section class="section diff-section">
      <div class="container">
        <div class="section-header center" data-aos>
          <span class="section-tag">DIFFERENTIATION</span>
          <h2>무엇이 다른가요?</h2>
        </div>
        <div class="diff-table-wrap" data-aos>
          <table class="diff-table">
            <thead>
            <tr>
              <th class="th-criterion">구분</th>
              <th class="th-common">기존 HR 시스템</th>
              <th class="th-hradar">HRADAR</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>AI의 역할</td>
              <td>단순 점수 예측 / 자동 통보</td>
              <td><strong>변화 신호 감지 & 해석</strong></td>
            </tr>
            <tr>
              <td>의사결정 주체</td>
              <td>시스템 중심 (기계적)</td>
              <td><strong>HR 담당자 중심 (지원 도구)</strong></td>
            </tr>
            <tr>
              <td>활용 시점</td>
              <td>연 1회 (사후 평가)</td>
              <td><strong>상시 모니터링 & 조기 대응</strong></td>
            </tr>
            <tr>
              <td>분석 기준</td>
              <td>고정된 알고리즘</td>
              <td><strong>HR이 직접 조정 가능</strong></td>
            </tr>
            <tr>
              <td>최종 결과</td>
              <td>등급(S/A/B) 산출</td>
              <td><strong>맞춤 인사이트 + 관리 가이드</strong></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 5. Process (How it works) -->
    <section class="section process-section">
      <div class="container">
        <div class="section-header center" data-aos>
          <span class="section-tag">workflow</span>
          <h2>데이터가 인사이트가 되는 과정</h2>
        </div>
        <div class="process-steps">
          <div class="step-card" data-aos>
            <div class="step-num">01</div>
            <div class="step-icon">🔗</div>
            <h3>데이터 연동</h3>
            <p>기존에 사용하시던 근태 관리, 성과 평가 툴의 데이터를 안전하게 연동합니다.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-card" data-aos>
            <div class="step-num">02</div>
            <div class="step-icon">🧠</div>
            <h3>AI 분석 & 감지</h3>
            <p>HRADAR 모델이 데이터를 분석하여 이탈 위험, 번아웃 신호, 성장 가능성을 포착합니다.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-card" data-aos>
            <div class="step-num">03</div>
            <div class="step-icon">💡</div>
            <h3>HR 액션</h3>
            <p>제공된 리포트와 가이드를 바탕으로, HR 담당자는 최적의 면담과 코칭을 진행합니다.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. FAQ Section -->
    <section class="section faq-section">
      <div class="container">
        <div class="section-header center" data-aos>
          <span class="section-tag">FAQ</span>
          <h2>자주 묻는 질문</h2>
        </div>
        <div class="faq-grid">
          <div class="faq-item" data-aos>
            <h3>Q. 초기 스타트업도 사용할 수 있나요?</h3>
            <p>네, 물론입니다. 오히려 데이터가 적을 때부터 체계적인 관리를 시작하면 조직 문화의 기틀을 잡는 데 큰 도움이 됩니다.</p>
          </div>
          <div class="faq-item" data-aos>
            <h3>Q. 기존 HR 데이터를 그대로 쓸 수 있나요?</h3>
            <p>엑셀 업로드 및 주요 HR SaaS 연동을 지원하여, 기존 데이터를 손쉽게 이관하고 분석할 수 있습니다.</p>
          </div>
          <div class="faq-item" data-aos>
            <h3>Q. 보안은 안전한가요?</h3>
            <p>모든 데이터는 암호화되어 저장되며, 민감한 개인정보는 철저하게 분리되어 관리됩니다.</p>
          </div>
          <div class="faq-item" data-aos>
            <h3>Q. 도입 비용은 어떻게 되나요?</h3>
            <p>현재 베타 기간 동안은 무료로 제공되며, 이후 기업 규모에 맞는 합리적인 요금제를 제안드릴 예정입니다.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container cta-container">
        <h2 class="cta-title">HR의 판단을 더 확신있게.</h2>
        <p class="cta-sub">HRADAR와 함께 데이터 기반의 인재 관리를 시작하세요.</p>
        <div class="cta-buttons">
          <button class="btn-lg-primary" @click="goToGateway">로그인 하러 가기</button>
          <button class="btn-lg-white" @click="switchToApply">서비스 도입 신청</button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <BrandLogo size="40" class="f-logo" />
        <p class="copyright">© 2025 HRADAR. All rights reserved.</p>
        <p class="f-slogan">AI assists. HR decides.</p>
      </div>
    </footer>
    <!-- Auth Modal -->
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BrandLogo from '@/components/common/BrandLogo.vue'

const router = useRouter()
const isScrolled = ref(false)

const switchToApply = () => {
  router.push('/register-company')
}

const goToGateway = () => {
  router.push('/gateway')
}





const scrollTo = (selector) => {
  const el = document.querySelector(selector)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

// Scroll detection logic
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

// Simple IntersectionObserver for scroll animations
let observer = null
const setupObserver = () => {
  const options = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate')
      }
    })
  }, options)

  document.querySelectorAll('[data-aos]').forEach((el) => observer.observe(el))
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  setupObserver()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (observer) observer.disconnect()
})
</script>

<style scoped>
/* @import url(...) - handled in App.vue or main.css typically, but kept here if it was there */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;700;900&display=swap');

/* --- Transitions --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* --- Reset & Base --- */
.page {
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  color: #1e293b;
  overflow-x: hidden;
  position: relative;
  background-color: #f8fafc;
  user-select: none;
}

.bg-layer {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
}
.gradient-bg {
  background:
    radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 85% 85%, rgba(99, 102, 241, 0.08) 0%, transparent 50%);
}
.noise-bg {
  opacity: 0.03;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

button { cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; }

/* --- Typography Helpers --- */
h1 { font-size: 3.5rem; line-height: 1.2; font-weight: 800; letter-spacing: -0.02em; }
h2 { font-size: 2.25rem; line-height: 1.3; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 20px; }
h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; }
p { font-size: 1.125rem; line-height: 1.7; color: #475569; }
.text-highlight { color: #2563eb; }

/* --- Navigation --- */
.nav {
  position: fixed;
  top: 0; left: 0; width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  z-index: 100;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.0);
}
.nav.scrolled {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  height: 60px;
}
.nav-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%; /* Ensure vertical centering */
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}
.logo-mark {
  cursor: pointer;
}
.nav-links {
  display: flex;
  gap: 32px;
}
.nav-links a {
  text-decoration: none;
  font-weight: 500;
  color: #64748b;
  font-size: 0.95rem;
  transition: color 0.2s;
}
.nav-links a:hover { color: #0f172a; }

.nav-actions { display: flex; gap: 12px; align-items: center; }
.btn-text { background: none; font-weight: 600; color: #475569; padding: 8px 16px; }
.btn-text:hover { color: #0f172a; }
.btn-primary {
  background: #0f172a;
  color: white;
  padding: 8px 20px;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.9rem;
}
.btn-primary:hover { background: #334155; transform: translateY(-1px); }

/* --- Hero Section --- */
.hero-section {
  padding-top: 140px;
  padding-bottom: 100px;
  min-height: 90vh;
  display: flex;
  align-items: center;
  background: transparent;
}
.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}
.kicker {
  display: inline-block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
  padding: 6px 12px;
  border-radius: 99px;
  margin-bottom: 24px;
}
.hero-title {
  margin-bottom: 24px;
  color: #0f172a;
}
.hero-desc {
  margin-bottom: 40px;
  font-size: 1.25rem;
  max-width: 540px;
}
.hero-btns {
  display: flex;
  justify-content: flex-start; /* Default left align */
  gap: 16px;
  margin-bottom: 24px;
}
.hero-btns.center {
  justify-content: center;
}
.btn-lg-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow:
    0 10px 25px rgba(37, 99, 235, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.btn-lg-primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    0 15px 35px rgba(37, 99, 235, 0.4),
    inset 0 1px 0 rgba(255,255,255,0.2);
}
.btn-lg-outline {
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(10px);
  color: #1e293b;
  border: 1px solid #cbd5e1;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s;
}
.btn-lg-outline:hover {
  background: white;
  border-color: #94a3b8;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}
.hero-note { font-size: 0.9rem; color: #94a3b8; margin-top: 12px; }

/* --- Hero Visual 3D --- */
.hero-visual {
  position: relative;
  height: 500px;
  perspective: 1000px;
}
.glass-card {
  background: white;
  border: 1px solid #f1f5f9;
  box-shadow: 0 12px 30px rgba(74,108,247,0.08);
  border-radius: 28px;
  position: absolute;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s;
}
.glass-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 30px 60px rgba(37, 99, 235, 0.15);
  z-index: 10;
}

.main-card {
  width: 320px;
  height: 420px;
  top: 20px;
  left: 60px;
  padding: 24px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  animation: float 6s ease-in-out infinite;
}
.float-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.c1 {
  top: 280px;
  right: 20px;
  width: 180px;
  height: 100px;
  z-index: 3;
  animation: floatWithRotate 7s ease-in-out infinite 0.5s;
}
.c2 {
  top: 80px;
  left: -20px;
  width: 160px;
  height: 80px;
  z-index: 1;
  animation: floatWithRotate 8s ease-in-out infinite 1.5s;
}

/* --- Card Internal --- */
.card-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
.avatar-group { display: flex; gap: 10px; align-items: center; }
.avatar { width: 40px; height: 40px; background: #e2e8f0; border-radius: 50%; }
.user-info .name-bar { width: 80px; height: 10px; background: #cbd5e1; border-radius: 4px; margin-bottom: 4px; }
.user-info .role-bar { width: 50px; height: 8px; background: #e2e8f0; border-radius: 4px; }
.status-badge { font-size: 0.75rem; padding: 4px 8px; border-radius: 6px; font-weight: 700; }
.status-badge.warning { background: #fef2f2; color: #ef4444; }

.radar-chart-mock { flex: 1; display: flex; justify-content: center; align-items: center; }
.radar-svg { width: 160px; height: 160px; overflow: visible; }
.radar-grid { fill: none; stroke: #e2e8f0; stroke-width: 0.8; }
.radar-grid.inner { stroke: #cbd5e1; stroke-dasharray: 2 2; }
.radar-axis { stroke: #cbd5e1; stroke-width: 0.5; }
.radar-val {
  fill: rgba(99, 102, 241, 0.25);
  stroke: #6366f1;
  stroke-width: 2;
  filter: drop-shadow(0 4px 6px rgba(99, 102, 241, 0.3));
  animation: radarPulse 4s ease-in-out infinite;
}
.radar-dot { fill: white; stroke: #6366f1; stroke-width: 1.5; }

@keyframes radarPulse {
  0%, 100% { fill-opacity: 0.7; transform: scale(1); transform-origin: center; }
  50% { fill-opacity: 0.9; transform: scale(1.02); transform-origin: center; }
}

.insight-row { display: flex; gap: 12px; margin-top: 20px; background: white; padding: 12px; border-radius: 12px; }
.icon-box { width: 32px; height: 32px; background: #fff7ed; color: #f97316; border-radius: 8px; display: grid; place-items: center; }
.text-box .l1 { font-size: 0.8rem; font-weight: 700; color: #1e293b; }
.text-box .l2 { font-size: 0.75rem; color: #64748b; }

.stat-num { font-size: 1.8rem; font-weight: 800; color: #2563eb; }
.stat-label { font-size: 0.85rem; font-weight: 600; color: #64748b; }

/* --- App Mockup Styling --- */
.app-mockup {
  width: 100%;
  height: 480px;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 40px 80px rgba(0,0,0,0.12);
  display: flex;
  border: 1px solid #e2e8f0;
}
.mock-sidebar {
  width: 60px;
  background: white;
  border-right: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  gap: 16px;
}
.side-item { width: 100%; height: 36px; background: #f1f5f9; border-radius: 8px; }
.side-item.active { background: #eff6ff; border: 1px solid #bfdbfe; }

.mock-main { flex: 1; display: flex; flex-direction: column; background: #f8fafc; }
.mock-top-bar { height: 48px; background: white; border-bottom: 1px solid #f1f5f9; }

.mock-content-grid {
  flex: 1;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 140px;
  gap: 20px;
}
.small-cards { display: flex; flex-direction: column; gap: 20px; }
.stat-card {
  position: relative;
  width: 100%;
  height: calc(50% - 10px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.stat-val { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.stat-lab { font-size: 0.75rem; color: #64748b; font-weight: 600; }

.app-mockup.mini { height: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border-radius: 16px; }
.mock-sidebar.slim { width: 40px; }
.mock-top-bar.small { height: 32px; }

/* Feature Mockups */
.profile-summary { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.avatar-circle { width: 36px; height: 36px; background: #e2e8f0; border-radius: 50%; }
.text-lines { flex: 1; }
.line { height: 6px; background: #cbd5e1; border-radius: 4px; margin-bottom: 6px; }
.line.w60 { width: 60%; }
.line.w40 { width: 40%; }

.chart-area-mock {
  flex: 1;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  display: grid;
  place-items: center;
}
.radar-svg-small {
  width: 100px;
  height: 100px;
  border: 2px dashed #e2e8f0;
  border-radius: 50%;
  position: relative;
}
.radar-svg-small::before {
  content: '';
  position: absolute;
  inset: 15%;
  background: rgba(37, 99, 235, 0.1);
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
  border: 1px solid #2563eb;
}

.admin-dashboard-mock { padding: 12px; height: 100%; }
.grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  height: 100%;
}
.mini-card { background: white; border: 1px solid #f1f5f9; border-radius: 8px; padding: 10px; }

.bar-chart-lines {
  height: 100%; width: 100%;
  background: linear-gradient(90deg, #eff6ff 0%, #eff6ff 40%, transparent 40%, transparent 50%, #eff6ff 50%, #eff6ff 80%, transparent 80%);
}
.gauge-half {
  width: 40px; height: 20px; border-radius: 40px 40px 0 0;
  border: 4px solid #e2e8f0; border-bottom: none; position: relative;
}
.gauge-half::after {
  content: ''; position: absolute; bottom: 0; left: 50%;
  width: 2px; height: 16px; background: #2563eb; transform: rotate(-30deg); transform-origin: bottom;
}
.line-graph {
  height: 100%; width: 100%;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40'%3E%3Cpath d='M0,35 Q20,10 40,25 T80,5 T200,30' fill='none' stroke='%232563eb' stroke-width='2'/%3E%3C/svg%3E");
}
.stack-bars {
  height: 100%; width: 100%;
  display: flex; gap: 4px; align-items: flex-end;
}
.stack-bars::before { content: ''; height: 60%; width: 4px; background: #cbd5e1; }
.stack-bars::after { content: ''; height: 80%; width: 4px; background: #2563eb; }

/* --- Section Commons --- */
.section { padding: 100px 0; }
.section-header { margin-bottom: 60px; }
.section-header.center { text-align: center; }
.section-tag {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #6366f1;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
  text-transform: uppercase;
}
.section h2 { color: #0f172a; }

/* --- Problem Section --- */
.problem-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}
.p-card {
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  transition: transform 0.3s;
}
.p-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(37, 99, 235, 0.1); border-color: #e0e7ff; }
.p-icon { font-size: 2.5rem; margin-bottom: 20px; }
.p-card h3 { margin-bottom: 16px; font-size: 1.3rem; }
.p-card p { font-size: 1rem; color: #64748b; }

/* --- Goal Section --- */
.goal-section { background: #0f172a; color: white; position: relative; overflow: hidden; }
.goal-content { text-align: center; max-width: 700px; margin: 0 auto; position: relative; z-index: 2; }
.goal-title { color: #60a5fa; font-size: 1rem; letter-spacing: 0.1em; margin-bottom: 30px; }
.goal-main { font-size: 2rem; font-weight: 600; line-height: 1.4; margin-bottom: 50px; color: #f8fafc; }
.goal-main strong { color: white; border-bottom: 2px solid #3b82f6; }
.goal-sub { display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; }
.item { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; color: #cbd5e1; }
.item .check { color: #3b82f6; font-weight: bold; }

/* --- Feature Section --- */
.feature-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  margin-bottom: 120px;
}
.feature-row.reverse { direction: rtl; }
.feature-row.reverse .f-text { direction: ltr; }

.f-num {
  font-size: 4rem;
  font-weight: 900;
  color: #e2e8f0;
  line-height: 1;
  margin-bottom: 20px;
}
.f-text h3 { font-size: 2rem; margin-bottom: 20px; color: #1e293b; }
.f-desc { font-size: 1.15rem; margin-bottom: 30px; }
.f-list { list-style: none; padding: 0; }
.f-list li { margin-bottom: 12px; position: relative; padding-left: 24px; color: #475569; }
.f-list li::before {
  content: "•"; color: #2563eb; position: absolute; left: 0; font-weight: bold;
}

.screen-mockup {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  aspect-ratio: 4/3;
  display: flex;
  flex-direction: column;
}
.screen-mockup:hover {
  transform: translateY(-5px) rotateX(2deg);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.2);
}

/* --- Process Section --- */
.process-section { background: #f8fafc; }
.process-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.step-card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  width: 280px;
  text-align: center;
  position: relative;
  transition: transform 0.3s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.step-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.step-num {
  font-size: 0.9rem; font-weight: 800; color: #cbd5e1; margin-bottom: 10px;
}
.step-icon { font-size: 2.5rem; margin-bottom: 16px; }
.step-card h3 { font-size: 1.2rem; margin-bottom: 12px; }
.step-card p { font-size: 0.95rem; color: #64748b; line-height: 1.5; }
.step-arrow { font-size: 2rem; color: #cbd5e1; font-weight: 300; }

/* --- FAQ Section --- */
.faq-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}
.faq-item {
  background: white;
  padding: 30px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.faq-item h3 { font-size: 1.15rem; margin-bottom: 12px; color: #1e293b; }
.faq-item p { font-size: 1rem; color: #64748b; line-height: 1.6; }

@media (max-width: 768px) {
  .process-steps { flex-direction: column; }
  .step-arrow { transform: rotate(90deg); margin: 10px 0; }
  .faq-grid { grid-template-columns: 1fr; }
}

.mock-header { height: 40px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; padding-left: 20px; font-size: 0.8rem; font-weight: 600; color: #94a3b8; }
.mock-body { flex: 1; padding: 20px; position: relative; }
.chart-area { width: 100%; height: 100%; background: #f1f5f9; border-radius: 12px; display: grid; place-items: center; color: #94a3b8; }
.segment-tag { position: absolute; top: 30px; right: 30px; background: #fee2e2; color: #dc2626; padding: 6px 12px; border-radius: 99px; font-size: 0.8rem; font-weight: 700; }

.control-panel { padding: 20px; display: flex; gap: 10px; border-bottom: 1px solid #f1f5f9; }
.slider { flex: 1; height: 6px; background: #e2e8f0; border-radius: 99px; }
.graph-area { flex: 1; margin: 20px; background: #f8fafc; border-radius: 8px; }

.timeline { display: flex; justify-content: space-between; align-items: center; padding: 40px 20px; margin-top: 40px; }
.t-node {
  background: white; border: 2px solid #cbd5e1; padding: 8px 16px; border-radius: 12px;
  font-weight: 600; font-size: 0.9rem; color: #64748b; z-index: 2;
}
.t-node.active { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
.t-line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 10px; }

/* --- Differentiation Table --- */
.diff-table-wrap {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  padding: 40px;
  overflow-x: auto;
}
.diff-table { width: 100%; border-collapse: collapse; }
.diff-table th { text-align: left; padding: 20px; font-size: 1.1rem; border-bottom: 2px solid #e2e8f0; color: #64748b; }
.diff-table td { padding: 24px 20px; border-bottom: 1px solid #f1f5f9; font-size: 1.05rem; }
.th-criterion { width: 20%; }
.th-common { width: 40%; color: #94a3b8; }
.th-hradar { width: 40%; color: #2563eb; }
.diff-table tr:last-child td { border-bottom: none; }
.diff-table td:nth-child(2) { color: #94a3b8; }
.diff-table td:nth-child(3) { color: #1e293b; font-weight: 500; }

/* --- CTA Section --- */
.cta-section { padding: 120px 0; text-align: center; }
.cta-title { font-size: 3rem; margin-bottom: 20px; color: #0f172a; }
.cta-sub { font-size: 1.4rem; color: #64748b; margin-bottom: 50px; }
.btn-lg-white {
  background: white;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.btn-lg-white:hover { border-color: #cbd5e1; transform: translateY(-2px); }
.cta-buttons { display: flex; gap: 20px; justify-content: center; }

/* --- Footer --- */
.footer { background: white; border-top: 1px solid #f1f5f9; padding: 60px 0; text-align: center; }
.f-logo { margin-bottom: 20px; justify-content: center; }
.copyright { color: #94a3b8; font-size: 0.9rem; margin-bottom: 6px; }
.f-slogan { color: #cbd5e1; font-weight: 600; font-size: 0.85rem; letter-spacing: 0.1em; }

/* --- Animation Utilities --- */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
@keyframes floatWithRotate {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(2deg); }
}

[data-aos] {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}
[data-aos].aos-animate {
  opacity: 1;
  transform: translateY(0);
}

/* --- Gradient Text --- */
.hero-title .text-highlight {
  color: transparent;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  -webkit-background-clip: text;
  background-clip: text;
  display: inline-block;
}



/* --- Auth Modal --- */
.auth-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  animation: fadeIn 0.3s ease-out;
}
.auth-modal-content {
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

/* --- Responsive --- */
@media (max-width: 960px) {
  .hero-content { grid-template-columns: 1fr; text-align: center; }
  .hero-text { margin-bottom: 60px; }
  .hero-btns { justify-content: center; }
  .hero-desc { margin-left: auto; margin-right: auto; }
  .feature-row { grid-template-columns: 1fr; gap: 40px; }
  .feature-row.reverse { direction: ltr; }
  .problem-grid { grid-template-columns: 1fr; }
  .main-card { left: 50%; transform: translateX(-50%); animation: none; }
  .c1 { right: 10%; animation: float 4s ease-in-out infinite; }
  .c2 { left: 10%; animation: float 5s ease-in-out infinite 1s; }
  h1 { font-size: 2.5rem; }
}
</style>
