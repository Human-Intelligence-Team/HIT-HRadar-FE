import axios from './axios.js'


/* 부서 목록 조회 */
export const fetchPositions = () => {
  return axios.get('/api/v1/positions');
}
