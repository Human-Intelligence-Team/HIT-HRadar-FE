import {fetchDepts} from "@/api/deptApii.js";
import {fetchPositions} from "@/api/positionApii.js";

export const submitting = ref(false)
export const errorMessage = ref('')
/* 이번 년도 기준 - 10년*/
import {ref} from "vue";

export const YEAR_OPTIONS = () => {

  const currentYear = new Date().getFullYear(); // 2026
  const years = 10;

  return Array.from({ length: years }, (_, i) => currentYear - i);

}

export const MONTH_OPTIONS = () => {
  return Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    return {
      label: `${month}월`,
      value: month
    };
  });
}

/* 분기 list */
export const QUARTER_OPTIONS = [
  { label: '1분기', value: 'Q1' },
  { label: '2분기', value: 'Q2' },
  { label: '3분기', value: 'Q3' },
  { label: '4분기', value: 'Q4' },
];

// 재직 상태
export const LEAVE_STATUS_OPTIONS = [
  { label: '재직', value: 'WORKING' },
  { label: '퇴사', value: 'RESIGNED' },
  { label: '휴직', value: 'LEAVE' },
];


// 부서
export const fetchDeptOptions = async () => {
  const result = await fetchDepts()
  const data = result.data

  if (!data.success) {
    throw new Error('부서 조회 실패')
  }

  return data.data.departments
}

// 직급
export const fetchPositionOptions = async () => {
  const result = await fetchPositions()
  const data = result.data

  if (!data.success) {
    throw new Error('직급 조회 실패')
  }

  return data.data.positions
}
