import axios from './axios.js'

/* 태그 목록 조회 */
export const fetchEmployees = (params) => {
  return axios.get('/api/v1/employees', {
    params
  });
}

export const fetchEmployeeById = (empId) => {
  return axios.get(`/api/v1/employees/${empId}`);
};
