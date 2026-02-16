import apiClient, { buildQueryString } from './client';

// Base endpoints
const ACADEMIC_YEARS_ENDPOINT = '/academics/years';
const BOARDS_ENDPOINT = '/academics/boards';
const CLASSES_ENDPOINT = '/academics/classes';
const SECTIONS_ENDPOINT = '/academics/sections';
const SUBJECTS_ENDPOINT = '/academics/subjects';

// ==================== Academic Years ====================

export const getAcademicYears = () => {
    return apiClient.get(`${ACADEMIC_YEARS_ENDPOINT}/`);
};

export const getAcademicYearById = (id) => {
    return apiClient.get(`${ACADEMIC_YEARS_ENDPOINT}/${id}/`);
};

export const getCurrentAcademicYear = () => {
    return apiClient.get(`${ACADEMIC_YEARS_ENDPOINT}/current/`);
};

export const createAcademicYear = (yearData) => {
    return apiClient.post(`${ACADEMIC_YEARS_ENDPOINT}/`, yearData);
};

export const updateAcademicYear = (id, yearData) => {
    return apiClient.put(`${ACADEMIC_YEARS_ENDPOINT}/${id}/`, yearData);
};

export const setCurrentAcademicYear = (id) => {
    return apiClient.post(`${ACADEMIC_YEARS_ENDPOINT}/${id}/set-current/`);
};

export const deleteAcademicYear = (id) => {
    return apiClient.delete(`${ACADEMIC_YEARS_ENDPOINT}/${id}/`);
};

// ==================== Boards ====================

export const getBoards = () => {
    return apiClient.get(`${BOARDS_ENDPOINT}/`);
};

export const getBoardById = (id) => {
    return apiClient.get(`${BOARDS_ENDPOINT}/${id}/`);
};

export const createBoard = (boardData) => {
    return apiClient.post(`${BOARDS_ENDPOINT}/`, boardData);
};

export const updateBoard = (id, boardData) => {
    return apiClient.put(`${BOARDS_ENDPOINT}/${id}/`, boardData);
};

export const patchBoard = (id, boardData) => {
    return apiClient.patch(`${BOARDS_ENDPOINT}/${id}/`, boardData);
};

export const deleteBoard = (id) => {
    return apiClient.delete(`${BOARDS_ENDPOINT}/${id}/`);
};

// Get board configuration
export const getBoardConfiguration = (id) => {
    return apiClient.get(`${BOARDS_ENDPOINT}/${id}/configuration/`);
};

// ==================== Classes ====================

export const getClasses = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${CLASSES_ENDPOINT}/?${queryString}`);
};

export const getClassById = (id) => {
    return apiClient.get(`${CLASSES_ENDPOINT}/${id}/`);
};

export const createClass = (classData) => {
    return apiClient.post(`${CLASSES_ENDPOINT}/`, classData);
};

export const updateClass = (id, classData) => {
    return apiClient.put(`${CLASSES_ENDPOINT}/${id}/`, classData);
};

export const patchClass = (id, classData) => {
    return apiClient.patch(`${CLASSES_ENDPOINT}/${id}/`, classData);
};

export const deleteClass = (id) => {
    return apiClient.delete(`${CLASSES_ENDPOINT}/${id}/`);
};

// Get class sections
export const getClassSections = (classId) => {
    return apiClient.get(`${CLASSES_ENDPOINT}/${classId}/sections/`);
};

// Get class subjects
export const getClassSubjects = (classId) => {
    return apiClient.get(`${CLASSES_ENDPOINT}/${classId}/subjects/`);
};

// Assign subjects to class
export const assignSubjectsToClass = (classId, subjects) => {
    return apiClient.post(`${CLASSES_ENDPOINT}/${classId}/assign-subjects/`, { subjects });
};

// ==================== Sections ====================

export const getSections = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${SECTIONS_ENDPOINT}/?${queryString}`);
};

export const getSectionById = (id) => {
    return apiClient.get(`${SECTIONS_ENDPOINT}/${id}/`);
};

export const createSection = (sectionData) => {
    return apiClient.post(`${SECTIONS_ENDPOINT}/`, sectionData);
};

export const updateSection = (id, sectionData) => {
    return apiClient.put(`${SECTIONS_ENDPOINT}/${id}/`, sectionData);
};

export const patchSection = (id, sectionData) => {
    return apiClient.patch(`${SECTIONS_ENDPOINT}/${id}/`, sectionData);
};

export const deleteSection = (id) => {
    return apiClient.delete(`${SECTIONS_ENDPOINT}/${id}/`);
};

// Get section students
export const getSectionStudents = (sectionId) => {
    return apiClient.get(`${SECTIONS_ENDPOINT}/${sectionId}/students/`);
};

// Get section timetable
export const getSectionTimetable = (sectionId) => {
    return apiClient.get(`${SECTIONS_ENDPOINT}/${sectionId}/timetable/`);
};

// Assign class teacher
export const assignClassTeacher = (sectionId, teacherId) => {
    return apiClient.post(`${SECTIONS_ENDPOINT}/${sectionId}/assign-teacher/`, { teacher_id: teacherId });
};

// ==================== Subjects ====================

export const getSubjects = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${SUBJECTS_ENDPOINT}/?${queryString}`);
};

export const getSubjectById = (id) => {
    return apiClient.get(`${SUBJECTS_ENDPOINT}/${id}/`);
};

export const createSubject = (subjectData) => {
    return apiClient.post(`${SUBJECTS_ENDPOINT}/`, subjectData);
};

export const updateSubject = (id, subjectData) => {
    return apiClient.put(`${SUBJECTS_ENDPOINT}/${id}/`, subjectData);
};

export const patchSubject = (id, subjectData) => {
    return apiClient.patch(`${SUBJECTS_ENDPOINT}/${id}/`, subjectData);
};

export const deleteSubject = (id) => {
    return apiClient.delete(`${SUBJECTS_ENDPOINT}/${id}/`);
};

// Get subject teachers
export const getSubjectTeachers = (subjectId) => {
    return apiClient.get(`${SUBJECTS_ENDPOINT}/${subjectId}/teachers/`);
};

// ==================== Student Enrollment ====================

export const enrollStudent = (enrollmentData) => {
    return apiClient.post('/academics/enrollments/', enrollmentData);
};

export const getStudentEnrollment = (studentId, academicYearId) => {
    return apiClient.get(`/academics/enrollments/?student=${studentId}&academic_year=${academicYearId}`);
};

export const updateEnrollment = (enrollmentId, enrollmentData) => {
    return apiClient.put(`/academics/enrollments/${enrollmentId}/`, enrollmentData);
};

// ==================== Teacher Assignment ====================

export const assignTeacherToSubject = (assignmentData) => {
    return apiClient.post('/academics/teacher-assignments/', assignmentData);
};

export const getTeacherAssignments = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`/academics/teacher-assignments/?${queryString}`);
};

export const updateTeacherAssignment = (assignmentId, assignmentData) => {
    return apiClient.put(`/academics/teacher-assignments/${assignmentId}/`, assignmentData);
};

export const deleteTeacherAssignment = (assignmentId) => {
    return apiClient.delete(`/academics/teacher-assignments/${assignmentId}/`);
};

// ==================== Statistics ====================

export const getAcademicStatistics = () => {
    return apiClient.get('/academics/statistics/');
};

// Alias for backward compatibility
export const getAcademicStats = getAcademicStatistics;

// ==================== Lesson Plans ====================

const LESSON_PLANS_ENDPOINT = '/academics/lesson-plans';
const SYLLABUS_UNITS_ENDPOINT = '/academics/syllabus-units';

export const getLessonPlans = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${LESSON_PLANS_ENDPOINT}/?${queryString}`);
};

export const getLessonPlanById = (id) => {
    return apiClient.get(`${LESSON_PLANS_ENDPOINT}/${id}/`);
};

export const createLessonPlan = (data) => {
    return apiClient.post(`${LESSON_PLANS_ENDPOINT}/`, data);
};

export const updateLessonPlan = (id, data) => {
    return apiClient.put(`${LESSON_PLANS_ENDPOINT}/${id}/`, data);
};

export const deleteLessonPlan = (id) => {
    return apiClient.delete(`${LESSON_PLANS_ENDPOINT}/${id}/`);
};

export const suggestLessonPlan = (data) => {
    return apiClient.post(`${LESSON_PLANS_ENDPOINT}/suggest/`, data);
};

// ==================== Syllabus Units ====================

export const getSyllabusUnits = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${SYLLABUS_UNITS_ENDPOINT}/?${queryString}`);
};

export const getSyllabusCoverage = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${SYLLABUS_UNITS_ENDPOINT}/coverage/?${queryString}`);
};

export const getClassStatistics = (classId) => {
    return apiClient.get(`${CLASSES_ENDPOINT}/${classId}/statistics/`);
};

export const getSectionStatistics = (sectionId) => {
    return apiClient.get(`${SECTIONS_ENDPOINT}/${sectionId}/statistics/`);
};
