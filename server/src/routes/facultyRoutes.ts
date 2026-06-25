import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';
import {
  getDashboardSummary,
  getTimetable,
  getStudents,
  getAssignedClasses,
  getAssignments,
  createAssignment,
  getSubmissions,
  gradeSubmission,
  markAttendance,
  postResults,
  getStudyMaterials,
  uploadStudyMaterial,
  deleteStudyMaterial
} from '../controllers/facultyController';

const router = Router();

// Protect all routes under Faculty Portal
router.use(protect);
router.use(checkRole(['Faculty', 'HOD', 'Admin']));

// Dashboard and details
router.get('/dashboard', getDashboardSummary);
router.get('/timetable', getTimetable);
router.get('/students', getStudents);
router.get('/assigned-classes', getAssignedClasses);

// Assignments & submissions
router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);
router.get('/submissions/:assignmentId', getSubmissions);
router.patch('/submissions/:submissionId/grade', gradeSubmission);

// Attendance register posting
router.post('/attendance', markAttendance);

// Grade management
router.post('/results', postResults);

// Study resources uploads
router.get('/study-materials', getStudyMaterials);
router.post('/study-materials', uploadStudyMaterial);
router.delete('/study-materials/:id', deleteStudyMaterial);

export default router;
