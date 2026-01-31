import axios from './axios';

/**
 * 현재 사용자의 휴가 목록을 조회합니다.
 */
export const fetchMyLeaves = async () => {
  return await axios.get(`/leave`);
};

/**
 * 특정 휴가의 상세 정보를 조회합니다.
 * @param {number} leaveId - 휴가 ID
 */
export const fetchLeaveDetail = async (leaveId) => {
  return await axios.get(`/leave/${leaveId}`);
};

/**
 * 연차 부여 및 잔여 정보를 조회합니다.
 * @param {number} grantId - 부여 ID
 */
export const fetchLeaveGrant = async (grantId) => {
  return await axios.get(`/leave/grant/${grantId}`);
};
