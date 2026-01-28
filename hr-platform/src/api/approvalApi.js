import axios from './axios';

// 내 문서함 조회 (내가 기안한 문서)
export const fetchMyDocuments = async (employeeId) => {
  return await axios.get(`/approvals/my-documents`, { params: { employeeId } });
};

// 결재 문서함 조회 (내가 결재자/대리결재자)
export const fetchApprovalTasks = async (employeeId) => {
  return await axios.get(`/approvals/approval-tasks`, { params: { employeeId } });
};

// 반려 문서함 조회 (내가 기안한 반려 문서)
export const fetchRejectedDocuments = async (employeeId) => {
  return await axios.get(`/approvals/rejected-documents`, { params: { employeeId } });
};

// 전체 문서함 조회 (관리자/인사팀)
export const fetchAllDocuments = async () => {
  return await axios.get(`/approvals/all-documents`); // 백엔드에 이 API 추가 필요
};
