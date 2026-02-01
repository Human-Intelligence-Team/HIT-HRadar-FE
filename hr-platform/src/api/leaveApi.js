import api from '@/api/axios'

export const getLeavePolicies = (companyId) => {
  return api.get('/api/v1/leave-policies', {
    params: { companyId },
  })
}

export const createLeavePolicy = (policyData) => {
  return api.post('/api/v1/admin/leave-policies', policyData)
}


/**
 * 휴가 신청을 위한 임시 결재 문서를 생성합니다.
 * @param {object} draftData - 임시 문서 생성 데이터
 * @returns {Promise<axios.ApiResponse<string>>} docId를 포함하는 응답
 */
export const createLeaveDraft = (draftData) => {
  return api.post('/api/v1/leave/draft', draftData);
}

/**
 * 휴가 신청 데이터를 저장합니다.
 * @param {number} docId - 임시 문서 ID
 * @param {object} leaveData - 휴가 신청 데이터
 * @returns {Promise<axios.ApiResponse<string>>}
 */
export const applyLeave = (docId, leaveData) => {
  return api.post(`/api/v1/leave/${docId}`, leaveData);
}

/**
 * 현재 로그인한 사용자의 모든 휴가 목록을 조회합니다.
 * @returns {Promise<axios.ApiResponse<any[]>>}
 */
export const getMyLeaves = () => {
  return api.get('/api/v1/leave');
};

/**
 * 특정 휴가 ID로 상세 정보를 조회합니다.
 * @param {number} leaveId - 휴가 ID
 * @returns {Promise<axios.ApiResponse<any>>}
 */
export const getLeaveDetail = (leaveId) => {
  return api.get(`/api/v1/leave/${leaveId}`);
};

/**
 * 특정 연차 지급 ID로 연차 정보를 조회합니다.
 * @param {number} grantId - 연차 지급 ID
 * @returns {Promise<axios.ApiResponse<any>>}
 */
export const getLeaveGrant = (grantId) => {
  return api.get(`/api/v1/leave/grant/${grantId}`);
};
