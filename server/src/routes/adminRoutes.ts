import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import {
  getDashboardSummary,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  suspendStudent,
  resetStudentPassword,
  importStudents,
  getFaculty,
  createFaculty,
  updateFaculty,
  deactivateFaculty,
  assignSubjects,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignHOD,
  getCourses,
  createCourse,
  getSubjects,
  createSubject,
  getAcademicYears,
  createAcademicYear,
  getSemesters,
  createSemester,
  getSections,
  createSection,
  getBooks,
  createBook,
  getCompanies,
  createCompany,
  getPlacementDrives,
  createPlacementDrive,
  updatePlacementApplicant,
  getComplaints,
  updateComplaintStatus,
  createAnnouncement,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  getAdminTimetables,
  createAdminTimetable,
  deleteAdminTimetable,
  getAdminAttendances,
  createAdminAttendance,
  getAdminAssignments,
  createAdminAssignment,
  getAdminExams,
  createAdminExam,
  getAdminResults,
  createAdminResult,
} from '../controllers/adminController';
import {
  createStudentSchema,
  updateStudentSchema,
  createFacultySchema,
  updateFacultySchema,
  createDepartmentSchema,
  createCourseSchema,
  createSubjectSchema,
  createAcademicYearSchema,
  createSemesterSchema,
  createSectionSchema,
  createPlacementSchema,
  updatePlacementApplicantSchema,
  createLibraryBookSchema,
} from '../schemas/adminSchema';

const router = Router();

// Protect all admin routes
router.use(protect);
router.use(checkRole(['Admin']));

// Dashboard
router.get('/dashboard', getDashboardSummary);

// Students
router.get('/students', getStudents);
router.post('/students', validateRequest(createStudentSchema), createStudent);
router.patch('/students/:id', validateRequest(updateStudentSchema), updateStudent);
router.delete('/students/:id', deleteStudent);
router.post('/students/import', importStudents);
router.patch('/students/:id/suspend', suspendStudent);
router.patch('/students/:id/reset-password', resetStudentPassword);

// Faculty
router.get('/faculty', getFaculty);
router.post('/faculty', validateRequest(createFacultySchema), createFaculty);
router.patch('/faculty/:id', validateRequest(updateFacultySchema), updateFaculty);
router.patch('/faculty/:id/deactivate', deactivateFaculty);
router.post('/faculty/assign', assignSubjects);

// Departments
router.get('/departments', getDepartments);
router.post('/departments', validateRequest(createDepartmentSchema), createDepartment);
router.patch('/departments/:id', validateRequest(createDepartmentSchema), updateDepartment);
router.delete('/departments/:id', deleteDepartment);
router.post('/departments/assign-hod', assignHOD);

// Courses & Subjects
router.get('/courses', getCourses);
router.post('/courses', validateRequest(createCourseSchema), createCourse);
router.get('/subjects', getSubjects);
router.post('/subjects', validateRequest(createSubjectSchema), createSubject);

// Academic Structures
router.get('/academic-years', getAcademicYears);
router.post('/academic-years', validateRequest(createAcademicYearSchema), createAcademicYear);
router.get('/semesters', getSemesters);
router.post('/semesters', validateRequest(createSemesterSchema), createSemester);
router.get('/sections', getSections);
router.post('/sections', validateRequest(createSectionSchema), createSection);

// Library
router.get('/library/books', getBooks);
router.post('/library/books', validateRequest(createLibraryBookSchema), createBook);

// Placement
router.get('/placements/companies', getCompanies);
router.post('/placements/companies', createCompany);
router.get('/placements/drives', getPlacementDrives);
router.post('/placements/drives', validateRequest(createPlacementSchema), createPlacementDrive);
router.patch('/placements/drives/:id/applicant', validateRequest(updatePlacementApplicantSchema), updatePlacementApplicant);

// Complaints
router.get('/complaints', getComplaints);
router.patch('/complaints/:id/status', updateComplaintStatus);

// Announcements
router.post('/announcements', createAnnouncement);

// Settings
router.get('/settings', getSystemSettings);
router.patch('/settings', updateSystemSettings);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

// Missing Academic Management CRUD
router.get('/timetables', getAdminTimetables);
router.post('/timetables', createAdminTimetable);
router.delete('/timetables/:id', deleteAdminTimetable);

router.get('/attendance', getAdminAttendances);
router.post('/attendance', createAdminAttendance);

router.get('/assignments', getAdminAssignments);
router.post('/assignments', createAdminAssignment);

router.get('/exams', getAdminExams);
router.post('/exams', createAdminExam);

router.get('/results', getAdminResults);
router.post('/results', createAdminResult);

export default router;
