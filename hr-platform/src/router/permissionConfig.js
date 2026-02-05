export const permissionConfig = {
    // --- Platform Admin ---
    '/admin/company-applications': 'PLATFORM_ADMIN',
    '/admin/user-accounts': 'PLATFORM_ADMIN',
    '/admin/approval-document-types': 'PLATFORM_ADMIN',
    '/admin/permissions': 'PLATFORM_ADMIN',

    // --- Notice ---
    '/notice': 'NOTICE_READ',
    '/notice/create': 'NOTICE_MANAGE',
    '/notice/:id': 'NOTICE_READ',
    '/notice/:id/edit': 'NOTICE_MANAGE',

    // --- Department ---
    '/organization': 'DEPT_READ',
    '/department/manage': 'DEPT_MANAGE',

    // --- Company ---
    '/company/my-manage': 'COMPANY_MANAGE',
    '/company/roles': 'ROLE_MANAGE',
    '/company/manage': 'COMPANY_MANAGE',

    // --- Goal ---
    '/goal': 'GOAL_READ',
    '/hr/goals': 'GOAL_MANAGE',
    '/goal/:goalId': 'GOAL_READ',
    '/to/goals': 'GOAL_TEAM_READ',
    '/goal/create': 'GOAL_READ',

    // --- Salary ---
    '/salary/dashboard': 'SALARY_READ',

    // --- Evaluation (Cycles) ---
    '/cycles': 'EVALUATION_MANAGE',
    '/cycles/:cycleId/edit': 'EVALUATION_MANAGE',
    '/hr/cycles': 'EVALUATION_MANAGE',
    '/hr/cycles/:cycleId': 'EVALUATION_MANAGE',
    '/hr/cycles/:cycleId/edit': 'EVALUATION_MANAGE',

    // --- Evaluation (Setup & Response) ---
    '/hr/evaluation/type/setting': 'EVALUATION_MANAGE',
    '/hr/evaluation/question/form/setting': 'EVALUATION_MANAGE',
    '/hr/evaluation/assignment': 'EVALUATION_MANAGE',
    '/hr/evaluation/assignment/status': 'EVALUATION_MANAGE',
    '/evaluation/assignment/response': 'EVALUATION_EXEC',
    '/hr/evaluation/response/result': 'EVALUATION_MANAGE',
    '/evaluation/response/my/result': 'EVALUATION_READ',

    // --- Grading ---
    '/grade/setting': 'GRADING_MANAGE',
    '/grading/list': 'GRADING_READ',
    '/hr/grading/list': 'GRADING_MANAGE',
    '/to/grading/list': 'GRADING_READ',
    '/hr/grading/list/approve': 'GRADING_MANAGE',
    '/my/grading': 'GRADING_READ',
    '/to/grading/objection': 'GRADING_MANAGE',
    '/hr/objections/:objectionId': 'GRADING_MANAGE',

    // --- Report ---
    '/all/competency/report': 'EVALUATION_MANAGE',
    '/me/competency/report': 'EVALUATION_READ',
};
