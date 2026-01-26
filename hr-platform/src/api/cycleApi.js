/*cycleApi.js*/
import axios from './axios.js'

// 회차 생성
export const createCycle = (data) => {
  return axios.post('/api/v1/evaluation-cycles', data)
}

// 회차 목록 조회
export const fetchCycles = () => {
  return axios.get('/api/v1/evaluation-cycles')
}

//회차 상세조회
export const fetchCycleDetail = (cycleId) => {
  return axios.get(`/api/v1/evaluation-cycles/${cycleId}`)
}

//회차 수정
export const updateCycle = (cycleId, data) => {
  return axios.put(`/api/v1/evaluation-cycles/${cycleId}`, data)
}

//화차 삭제
export const deleteCycle = (cycleId) => {
  return axios.delete(`/api/v1/evaluation-cycles/${cycleId}/delete`)
}
