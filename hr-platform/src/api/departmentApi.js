import api from './axios.js';

/* ---------------------------
 * 부서 관리 (Department)
 * --------------------------- */

/**
 * 부서 등록
 * POST /departments
 * @param {Object} data - { "parentDeptId": null, "deptName": "...", "deptCode": "..." }
 */
export function createDepartment(data) {
    return api.post('/api/v1/departments', data);
}

/**
 * 부서 수정
 * PATCH /departments/{deptId}
 * @param {Number} deptId
 * @param {Object} data - { "deptName": "...", "managerId": ..., "common": ... }
 */
export function updateDepartment(deptId, data) {
    return api.patch(`/api/v1/departments/${deptId}`, data);
}

/**
 * 부서 삭제
 * DELETE /departments/{deptId}
 * @param {Number} deptId
 */
export function deleteDepartment(deptId) {
    return api.delete(`/api/v1/departments/${deptId}`);
}

/**
 * 부서 단건 조회
 * GET /departments/{deptId}
 * @param {Number} deptId
 */
export function getDepartmentById(deptId) {
    return api.get(`/api/v1/departments/${deptId}`);
}

/**
 * 회사별 부서 전체 조회
 * GET /departments
 */
export function getAllDepartmentsByCompany() {
    return api.get('/api/v1/departments');
}

/**
 * 조직도 조회
 * GET /departments/organization-chart
 */
export function getOrganizationChart() {
    return api.get('/api/v1/departments/organization-chart');
}
