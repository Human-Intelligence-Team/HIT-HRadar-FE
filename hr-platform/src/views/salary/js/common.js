// 오늘 날짜 yyyy-mm-dd
export function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 0-based
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// 올해 년도
export function getYear() {
  const today = new Date();
  const year = today.getFullYear();
  return year
}


// 기본급
export const BASIC_OPTIONS = [
  { value: 'REGULAR', label: '정기 인상' },
  { value: 'PERFORMANCE', label: '성과 인상' },
  { value: 'PROMOTION', label: '승진 인상' },
  { value: 'SPECIAL', label: '특별 인상' },
]

// 변동 보상
export const COMPENSATION_OPTIONS = [
  { label: '성과금', value: 'PERFORMANCE' },
  { label: '상여금', value: 'BONUS' },
  { label: '인센티브', value: 'INCENTIVE' },
  { label: '기타 수당', value: 'ALLOWANCE' },
]

export const APPROVAL_OPTIONS = [
  { label: '임시저장', value: 'DRAFT' },
  { label: '결재 진행중', value: 'IN_PROGRESS' },
  { label: '결재 승인', value: 'APPROVED' },
  { label: '반려', value: 'REJECTED' },
  { label: '회수', value: 'WITHDRAWN' },
]

