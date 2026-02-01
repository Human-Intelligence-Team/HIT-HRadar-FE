import axios from './axios.js'

/**
 * 개인 업무 기여도 조회 API
 */
export const fetchMyContribution = () => {
  return axios.get('/api/v1/my-dashboard/contribution');
};
