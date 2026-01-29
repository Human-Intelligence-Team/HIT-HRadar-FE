import api from './axios.js';


export function applyCompanyApi(payload) {
  return api.post('/api/v1/company-applications/submit', payload, { skipAuth: true });
}
