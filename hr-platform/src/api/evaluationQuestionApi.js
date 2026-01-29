import axios from '@/utils/axios'

// 질문 생성
export const createEvaluationQuestion = (sectionId, payload) => {
  return axios.post(
    `/evaluation-sections/${sectionId}/questions`,
    payload
  )
}

// 질문 수정
export const updateEvaluationQuestion = (questionId, payload) => {
  return axios.put(
    `/evaluation-sections/questions/${questionId}`,
    payload
  )
}

// 질문 삭제
export const deleteEvaluationQuestion = (questionId) => {
  return axios.delete(
    `/evaluation-sections/questions/${questionId}`
  )
}
