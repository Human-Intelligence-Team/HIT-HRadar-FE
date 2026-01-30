import axios from './axios.js'

export const saveEvaluationResponseDraft = (data) => {
  return axios.put(
    '/api/v1/evaluation-responses/draft',
    data
  )
}
export const submitEvaluationResponse = (assignmentId) => {
  return axios.post(
    `/api/v1/evaluation-responses/${assignmentId}/submit`
  )
}
export const fetchEvaluationResponses = (assignmentId) => {
  return axios.get(
    `/api/v1/evaluation-responses/${assignmentId}`
  )
}
