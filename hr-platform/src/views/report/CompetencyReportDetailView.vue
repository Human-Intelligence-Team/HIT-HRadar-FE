<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goListPage = (year) => {
  // all 일 때
  router.push(`/all/competency/report/employee/${year}`);

  // dept 일 때
  // router.push('/dept/competency/report');

  // me 일 때
  //router.push('/me/competency/report')
}
</script>

<template>
  <div class="sub">역량강화 리포트</div>

  <div class="section-btn">

    <div>
      <button class="btn primary">PDF 다운로드</button>
      <button class="btn" @click="goListPage(2025)" type="button">목록</button>
    </div>
  </div>

  <div class="content">
    <div class="card">
      <div class="section-title">
        <h1>2025년도 2분기 역량강화 리포트</h1>
        <div class="right-actions">
          <span class="badge good">
            <span class="dot"></span>
            분석 완료
          </span>
        </div>
      </div>
      <div class="card-bd">
        <div class="card-name">
          김사원 (영업팀|사원)
        </div>
      </div>
    </div>


    <div class="grid cols-2">
      <div class="card">
        <div class="card-hd">
          <h2>KPI / OKR 결과 요약</h2>
        </div>
        <div class="card-bd">
          <p>
            2025년 2분기 동안 설정된 주요 KPI 및 OKR 달성률은 전반적으로
            목표 대비 <b>우수</b>한 수준을 기록했습니다.
          </p>

          <ul class="list" style="margin-top:12px;">
            <li class="li">
              <div class="li-title">매출 목표 달성률 112%</div>
              <div class="li-meta">신규 고객 유치 및 기존 고객 재계약 성과</div>
            </li>
            <li class="li">
              <div class="li-title">OKR 핵심 과제 4건 중 3건 달성</div>
              <div class="li-meta">업무 주도성과 일정 관리 역량 향상</div>
            </li>
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-hd">
          <h2>역량 분석 결과</h2>
        </div>
        <div class="card-bd">
          <table class="table">
            <thead>
            <tr>
              <th>역량 항목</th>
              <th>평가</th>
              <th>코멘트</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>문제 해결 능력</td>
              <td>
                <span class="badge good">
                  <span class="dot"></span> 우수
                </span>
              </td>
              <td>현장 이슈에 대한 빠른 판단과 대응 능력이 뛰어남</td>
            </tr>
            <tr>
              <td>커뮤니케이션</td>
              <td>
                <span class="badge warn">
                  <span class="dot"></span> 보통
                </span>
              </td>
              <td>보고 구조는 명확하나 사전 공유가 다소 부족</td>
            </tr>
            <tr>
              <td>리더십</td>
              <td>
                <span class="badge warn">
                  <span class="dot"></span> 보통
                </span>
              </td>
              <td>팀 내 영향력 확대 가능성 존재</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <div class="card" style="margin-top:14px;">
      <div class="card-hd">
        <h2>역량 강화 추천 프로그램</h2>
      </div>
      <div class="card-bd">
        <div class="list">
          <div class="li">
            <div class="li-title">💡 실무형 커뮤니케이션 워크숍</div>
            <div class="li-contents">
              <div class="li-meta">
                보고 및 협업 상황에서의 메시지 구조화 훈련
              </div>
              <div style="display:flex; gap:16px; flex-wrap:wrap;">
                <div class="pill">난이도 · 하</div>
                <div class="pill">학습시간 · 3시간</div>
              </div>
            </div>

          </div>
          <div class="li">
            <div class="li-title">📈 영업 데이터 기반 전략 수립 과정</div>
            <div class="li-contents">
              <div class="li-meta">
                수치 기반 의사결정 역량 강화
              </div>
              <div style="display:flex; gap:16px; flex-wrap:wrap;">
                <div class="pill">난이도 · 하</div>
                <div class="pill">학습시간 · 3시간</div>
              </div>
            </div>

          </div>
          <div class="li">
            <div class="li-title">🧠 주니어 리더십 마이크로 코스</div>

            <div class="li-contents">
              <div class="li-meta">
                비공식 리더십과 영향력 확대를 위한 교육
              </div>
              <div style="display:flex; gap:16px; flex-wrap:wrap;">
                <div class="pill">난이도 · 하</div>
                <div class="pill">학습시간 · 3시간</div>
              </div>
            </div>
          </div>
        </div>

        <div class="hint">
          * 추천 프로그램은 회사 내 학습 콘텐츠를 기반으로 생성되었습니다.
        </div>
      </div>
    </div>

  </div>

</template>

<style scoped>
.section-btn {
  margin-right : 30px;
  display: flex;
  justify-content: end;
}

.section-btn .btn {
  margin-left: 10px;
}

.content .card {
  padding : 20px;
  margin-bottom: 30px;
}

.card-bd .card-name {
  display: flex;
  justify-content: flex-end;
  font-weight: bold;
}

.li-contents {
  display: flex;
  justify-content: space-between;
}

</style>
