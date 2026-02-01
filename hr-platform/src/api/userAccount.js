import api from '@/api/axios'

// 목록 조회
export function fetchUserAccounts(params) {
  return api.get('/api/v1/user-accounts', { params })
}

// 이름으로 사용자 검색
export function searchUsers(query) {
  return api.get('/api/v1/user-accounts', { params: { name: query } });
}

// 상세 조회
export function fetchUserAccountDetail(accId) {
  return api.get(`/api/v1/user-accounts/${accId}`)
}

// (관리자용) Login ID 조회
export function fetchAdminLoginId(accId) {
  return api.get(`/api/v1/adminAccounts/${accId}/login-id`)
}
