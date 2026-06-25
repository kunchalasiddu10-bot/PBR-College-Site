import { Router } from 'express';
import {
  getDashboardSummary,
  getProfile,
  updateProfile,
  getAttendance,
  getTimetable,
  getAssignments,
  submitAssignment,
  getExams,
  getResults,
  getLibrary,
  getComplaints,
  createComplaint,
  getNotifications,
  readNotification,
} from '../controllers/studentController';
import { protect } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import {
  createComplaintSchema,
  submitAssignmentSchema,
  updateStudentProfileSchema,
} from '../schemas/studentSchema';

const router = Router();

// Secure all endpoints under this router: Must be logged in as a Student
router.use(protect);
router.use(checkRole(['Student']));

// Student core dashboard summaries & profile lookups
router.get('/dashboard', getDashboardSummary);
router.get('/profile', getProfile);
router.patch('/profile', validateRequest(updateStudentProfileSchema), updateProfile);

// Academics endpoints
router.get('/attendance', getAttendance);
router.get('/timetable', getTimetable);

// Assignments & submissions
router.get('/assignments', getAssignments);
router.post('/assignments/:id/submit', validateRequest(submitAssignmentSchema), submitAssignment);

// Grading & schedule transcripts
router.get('/exams', getExams);
router.get('/results', getResults);

// Support & ancillary services
router.get('/library', getLibrary);
router.get('/complaints', getComplaints);
router.post('/complaints', validateRequest(createComplaintSchema), createComplaint);

// Notifications alert controls
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', readNotification);

export default router;
