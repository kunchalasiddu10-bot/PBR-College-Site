import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';
import {
  getDashboardSummary,
  getFacultyWorkload,
  getDepartmentTimetable,
  getDepartmentComplaints,
  resolveComplaint,
  getDepartmentResults,
  getDepartmentAttendance
} from '../controllers/hodController';

const router = Router();

// Protect HOD routes
router.use(protect);
router.use(checkRole(['HOD', 'Admin']));

// Details
router.get('/dashboard', getDashboardSummary);
router.get('/workload', getFacultyWorkload);
router.get('/timetable', getDepartmentTimetable);
router.get('/complaints', getDepartmentComplaints);
router.patch('/complaints/:id', resolveComplaint);
router.get('/results', getDepartmentResults);
router.get('/attendance', getDepartmentAttendance);

export default router;
