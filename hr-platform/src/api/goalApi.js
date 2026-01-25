import axios from './axios.js'
/*goalApi.js*/
//조직 Goal 트리 조회
export const fetchOrganizationGoals = () => {
  return axios.get('/api/v1/goals')
}

//내 Goal 트리 조회
export const fetchMyGoals = () =>
  axios.get('/api/v1/goals/me')

//전체 부서 조회
export const fetchDepartmentGoals = (departmentId) =>
  axios.get('/api/v1/goals/all', {
    params: { departmentId },
  })

//목표 상세 조회
export const fetchGoalDetail = (goalId) => {
  return axios.get(`/api/v1/goals/${goalId}/detail`)
}

// 승인
export const approveGoal = (goalId) =>
  axios.post(`/api/v1/goals/${goalId}/approve`)

// 반려
export const rejectGoal = (goalId, rejectReason) =>
  axios.post(`/api/v1/goals/${goalId}/reject`, {
    rejectReason,
  })
