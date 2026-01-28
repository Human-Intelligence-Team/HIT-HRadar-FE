import axios from './axios'

/**
 * 공지 목록 조회
 * GET /notices
 */
export const fetchNotices = () => {
  return axios.get('/api/v1/notices')
}

/**
 * 공지 목록 검색
 * GET /notices/search
 */
export const searchNotices = (params) => {
  return axios.get('/api/v1/notices/search', { params })
}

/**
 * 공지 카테고리 목록 조회
 * GET /api/v1/notices/categories
 */
export const fetchNoticeCategories = () => {
  return axios.get('/api/v1/notices/categories')
}

/**
 * 공지 상세 조회
 * GET /notices/{id}
 * (아직 백엔드 없음 스펙만 고정)
 */
export const fetchNoticeDetail = (id) => {
  return axios.get(`/api/v1/notices/${id}`)
}

/**
 * 공지 생성
 * POST /notices (multipart)
 */
export const createNotice = (notice, files) => {
  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify(notice)], { type: 'application/json' })
  )
  if (files?.length) {
    files.forEach((f) => formData.append('files', f))
  }

  return axios.post('/api/v1/notices', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * 공지 수정
 * PUT /notices/{id}
 */
export const updateNotice = (id, notice) => {
  return axios.put(`/api/v1/notices/${id}`, notice)
}

/**
 * 공지 삭제
 * DELETE /notices/{id}
 */
export const deleteNotice = (id) => {
  return axios.delete(`/api/v1/notices/${id}`)
}

/**
 * 본문 이미지 업로드
 * POST /notices/images
 */
export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('image', file)
  return axios.post('/api/v1/notices/images', formData)
}

/**
 * 본문 이미지 삭제
 * DELETE /notices/images?imageUrl=
 */
export const deleteImage = (imageUrl) => {
  return axios.delete('/api/v1/notices/images', {
    params: { imageUrl },
  })
}
