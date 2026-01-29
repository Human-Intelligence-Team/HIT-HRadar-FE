import axios from './axios';

// --- IP 정책 관리 (Admin) ---

/**
 * 회사 전체 IP 정책 목록 조회
 * @param {number} comId - 회사 ID
 */
export const fetchIpPolicies = async (comId) => {
  return await axios.get(`/admin/ip-policies`, { params: { comId } });
};

/**
 * 신규 IP 정책 등록
 * @param {object} policyData - RegisterIpPolicyRequest
 */
export const createIpPolicy = async (policyData) => {
  return await axios.post(`/attendance/ip-policies`, policyData);
};

/**
 * IP 정책 수정 (내용)
 * @param {number} policyId - IP 정책 ID
 * @param {object} policyData - UpdateIpPolicyRequest
 */
export const updateIpPolicy = async (policyId, policyData) => {
  return await axios.patch(`/attendance/ip-policies/${policyId}`, policyData);
};

/**
 * IP 정책 상태 변경 (활성/비활성)
 * @param {number} policyId - IP 정책 ID
 * @param {object} statusData - ChangeIpPolicyRequest ({ enabled: boolean })
 */
export const changeIpPolicyStatus = async (policyId, statusData) => {
  return await axios.patch(`/attendance/ip-policies/${policyId}/status`, statusData);
};


/**
 * IP 정책 삭제
 * @param {number} policyId - IP 정책 ID
 */
export const deleteIpPolicy = async (policyId) => {
  return await axios.delete(`/attendance/ip-policies/${policyId}`);
};


// --- 사원 출퇴근 관리 ---

/**
 * 출/퇴근 처리 (IP 기반)
 */
export const processAttendance = async () => {
  return await axios.post(`/attendance/check`);
};

/**
 * 나의 오늘 근태 상세 정보 조회
 * @param {number} targetEmpId - 직원 ID
 * @param {string} workDate - 조회 날짜 (YYYY-MM-DD)
 */
export const fetchMyTodayAttendance = async (targetEmpId, workDate) => {
  return await axios.get(`/api/attendance/detail`, { params: { targetEmpId, workDate } });
};

/**
 * 부서원 근태 현황 조회 (오늘)
 * @param {number} targetDeptId - 부서 ID
 * @param {string} date - 조회 날짜 (YYYY-MM-DD)
 */
/**
 * 월별 근태 현황 조회 (직원 또는 부서)
 * @param {number} targetId - 직원 ID 또는 부서 ID
 * @param {boolean} isDepartment - 부서 조회를 위한 경우 true
 * @param {string} fromDate - 조회 시작 날짜 (YYYY-MM-DD)
 * @param {string} toDate - 조회 종료 날짜 (YYYY-MM-DD)
 */
export const fetchMonthlyAttendance = async (targetId, isDepartment, fromDate, toDate) => {
  const params = {
    fromDate,
    toDate
  };
  if (isDepartment) {
    params.targetDeptId = targetId;
  } else {
    params.targetEmpId = targetId;
  }
  return await axios.get(`/api/attendance`, { params });
};
