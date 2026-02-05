import axios from './axios.js'

/* 기본급/변동보상 등록 */
export const createSalaryApprover = (payload) => {
  return axios.post('/api/v1/salary', payload);
}

/* 기본급 결재 목록 조회 */
export const fetchBasicSalaries = () => {
  return axios.get('/api/v1/basic-salaries');
}

/* 변동보상 결재 목록 조회*/
export const fetchCompensationSalaries = () => {
  return axios.get('/api/v1/compensation-salaries');
}

/*기본급 사원별 목록 조회*/
export const fetchBasicSalariesById = (id,params) => {
  return axios.get(`/api/v1/basic-salaries/${id}`, {
    params
  });
}

/*변동보상 사원별 목록 조회*/
export const fetchCompensationSalariesById = (id,params) => {
  return axios.get(`/api/v1/compensation-salaries/${id}`, {
    params
  });
}

/* 기본급 히스토리 */
export const fetchBasicHistory = (id,params) => {
  return axios.get(`/api/v1/basic-salaries/${id}/history`, {
    params
  });
}


/* 기본급 마이 히스토리 */
export const fetchBasicHistoryByMe = (params) => {
  return axios.get(`/api/v1/basic-salaries/summary/me`, {
    params
  });
}

/* 변동보상 히스토리 */
export const fetchCompensationHistory = (id,params) => {
  return axios.get(`/api/v1/compensation-salaries/${id}/history`, {
    params
  });
}

