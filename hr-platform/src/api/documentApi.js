import axios from './axios.js'

export async function fetchDocuments() {
  const res = await axios.get('/api/v1/docs')
  return res.data.data.documents
}

export async function fetchDocumentDetail(id) {
  const res = await axios.get(`/api/v1/docs/${id}`)
  return res.data.data
}

export async function previewDocumentCsv(file) {
  const form = new FormData()
  form.append('file', file)

  const res = await axios.post('/api/v1/docs/preview', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function commitDocument(payload) {
  await axios.post('/api/v1/docs/commit', payload)
}

export async function downloadDocumentTemplate() {
  const res = await axios.get('/api/v1/docs/template', {
    responseType: 'blob'
  })
  return res.data
}

