import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import Student from '../models/Student';
import Department from '../models/Department';
import Subject from '../models/Subject';
import Timetable from '../models/Timetable';
import Attendance from '../models/Attendance';
import Result from '../models/Result';
import Complaint from '../models/Complaint';
import FacultyAssignment from '../models/FacultyAssignment';
import AppError from '../utils/AppError';

/**
 * Resolve HOD Department Helper
 */
const getHODDepartment = async (user: any) => {
  if (!user.department) return null;
  return await Department.findOne({
    $or: [
      { code: user.department },
      { name: user.department },
      { name: new RegExp(user.department, 'i') },
      { code: new RegExp(user.department, 'i') }
    ]
  });
};

/**
 * Department Dashboard Summary
 */
export const getDashboardSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new AppError('HOD user profile not found', 404);
    }

    const dept = await getHODDepartment(user);
    const deptId = dept ? dept._id : null;

    // 1. Student Count
    const studentCount = deptId ? await Student.countDocuments({ department: deptId }) : 0;

    // 2. Faculty Count (users with role 'Faculty' in same department string)
    const facultyCount = await User.countDocuments({
      role: 'Faculty',
      department: user.department
    });

    // 3. Department Subjects
    const subjectsCount = deptId ? await Subject.countDocuments({ department: deptId }) : 0;

    // 4. Pending Complaints in Department
    let pendingComplaints = 0;
    if (deptId) {
      const studentIds = (await Student.find({ department: deptId })).map((s) => s._id);
      pendingComplaints = await Complaint.countDocuments({
        student: { $in: studentIds },
        status: { $in: ['Open', 'In-Progress'] }
      });
    }

    // 5. Department overall attendance average
    let averageAttendance = 85; // Fallback default
    if (deptId) {
      const studentIds = (await Student.find({ department: deptId })).map((s) => s._id);
      if (studentIds.length > 0) {
        const total = await Attendance.countDocuments({ student: { $in: studentIds } });
        const present = await Attendance.countDocuments({
          student: { $in: studentIds },
          status: { $in: ['Present', 'Late'] }
        });
        if (total > 0) {
          averageAttendance = Math.round((present / total) * 100);
        }
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          studentCount,
          facultyCount,
          subjectsCount,
          pendingComplaints,
          averageAttendance
        },
        department: dept
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Faculty Workload & Allocation List
 */
export const getFacultyWorkload = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw new AppError('HOD profile not found', 404);

    // Get all faculty members of this department
    const facultyMembers = await User.find({
      role: 'Faculty',
      department: user.department
    });

    const workloadList = [];
    for (const f of facultyMembers) {
      const allocations = await FacultyAssignment.find({ faculty: f._id })
        .populate('subject')
        .populate('section');

      const totalCredits = allocations.reduce((sum, a: any) => sum + (a.subject?.credits || 0), 0);

      workloadList.push({
        faculty: {
          id: f._id,
          name: f.name,
          email: f.email,
          profileImage: f.profileImage
        },
        allocationsCount: allocations.length,
        totalCredits,
        allocations: allocations.map((a: any) => ({
          subject: a.subject,
          section: a.section
        }))
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        workload: workloadList
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Department Timetable Allocation Grid
 */
export const getDepartmentTimetable = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw new AppError('HOD profile not found', 404);

    const dept = await getHODDepartment(user);
    if (!dept) {
      throw new AppError('Department details not configured for user', 400);
    }

    const timetables = await Timetable.find({ department: dept._id })
      .populate('subject', 'name code');

    res.status(200).json({
      status: 'success',
      data: {
        timetables
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Department Complaints Feed
 */
export const getDepartmentComplaints = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw new AppError('HOD profile not found', 404);

    const dept = await getHODDepartment(user);
    if (!dept) throw new AppError('Department details not configured for user', 400);

    const students = await Student.find({ department: dept._id });
    const studentIds = students.map((s) => s._id);

    const complaints = await Complaint.find({ student: { $in: studentIds } })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        complaints
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Complaint Ticket
 */
export const resolveComplaint = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status, remarks },
      { new: true }
    );

    if (!complaint) {
      throw new AppError('Complaint ticket not found', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Complaint ticket updated successfully.',
      data: {
        complaint
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Department Results Analytics
 */
export const getDepartmentResults = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw new AppError('HOD profile not found', 404);

    const dept = await getHODDepartment(user);
    if (!dept) throw new AppError('Department details not configured for user', 400);

    const students = await Student.find({ department: dept._id });
    const studentIds = students.map((s) => s._id);

    const results = await Result.find({ student: { $in: studentIds } })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('subject', 'name code credits');

    res.status(200).json({
      status: 'success',
      data: {
        results
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Department Performance and Shortage Alerts
 */
export const getDepartmentAttendance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw new AppError('HOD profile not found', 404);

    const dept = await getHODDepartment(user);
    if (!dept) throw new AppError('Department details not configured for user', 400);

    const students = await Student.find({ department: dept._id })
      .populate('user', 'name email status');

    const subjects = await Subject.find({ department: dept._id });

    const attendanceRecords = [];
    for (const student of students) {
      const studentSummary: any = {
        studentId: student._id,
        name: (student.user as any)?.name || '',
        rollNumber: student.rollNumber,
        section: student.section,
        semester: student.currentSemester,
        subjectWise: []
      };

      let overallTotal = 0;
      let overallPresent = 0;

      for (const sub of subjects) {
        const total = await Attendance.countDocuments({ student: student._id, subject: sub._id });
        const present = await Attendance.countDocuments({
          student: student._id,
          subject: sub._id,
          status: { $in: ['Present', 'Late'] }
        });

        if (total > 0) {
          overallTotal += total;
          overallPresent += present;
          studentSummary.subjectWise.push({
            subjectName: sub.name,
            subjectCode: sub.code,
            percentage: Math.round((present / total) * 100)
          });
        }
      }

      studentSummary.overallPercentage = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 100;
      attendanceRecords.push(studentSummary);
    }

    res.status(200).json({
      status: 'success',
      data: {
        attendanceRecords
      }
    });
  } catch (error) {
    next(error);
  }
};
