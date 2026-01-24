import axios from './axios.js'

//조직 Goal 트리 조회
export const fetchOrganizationGoals = () => {
  return axios.get('/api/v1/goals')
}

//내 Goal 트리 조회
export const fetchMyGoals = () =>
  axios.get('/api/v1/goals/me')

export const fetchDepartmentGoals = (departmentId) =>
  axios.get('/api/v1/goals/all', {
    params: { departmentId },
  })
