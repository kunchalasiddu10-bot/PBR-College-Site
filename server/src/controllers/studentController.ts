import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Student from '../models/Student';
import User from '../models/User';
import Department from '../models/Department';
import Subject from '../models/Subject';
import Timetable from '../models/Timetable';
import Attendance from '../models/Attendance';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import Exam from '../models/Exam';
import Result from '../models/Result';
import LibraryBook from '../models/LibraryBook';
import LibraryLoan from '../models/LibraryLoan';
import Complaint from '../models/Complaint';
import Notification from '../models/Notification';
import Event from '../models/Event';
import AppError from '../utils/AppError';

/**
 * Helper to fetch Student record linked to logged-in User
 */
const getStudentOrThrow = async (userId: string): Promise<any> => {
  const student = await Student.findOne({ user: userId });
  if (!student) {
    throw new AppError('Student profile not found.', 404);
  }
  return student;
};

/**
 * Get Student Dashboard Summary stats
 */
export const getDashboardSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = await getStudentOrThrow(req.user!.id);

    // 1. Fetch overall attendance rates
    const totalClasses = await Attendance.countDocuments({ student: student._id });
    const presentClasses = await Attendance.countDocuments({
      student: student._id,
      status: { $in: ['Present', 'Late'] },
    });
    const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

    // 2. Fetch pending assignments
    const assignments = await Assignment.find({
      semester: student.currentSemester,
      section: student.section,
    });
    const assignmentIds = assignments.map((a) => a._id);
    const submissions = await Submission.find({
      student: student._id,
      assignment: { $in: assignmentIds },
    });
    const submittedAssignmentIds = submissions.map((s) => s.assignment.toString());
    const pendingAssignmentsCount = assignments.filter(
      (a) => !submittedAssignmentIds.includes(a._id.toString())
    ).length;

    // 3. Library loans status
    const activeLibraryLoansCount = await LibraryLoan.countDocuments({
      student: student._id,
      status: 'Issued',
    });

    // 4. Upcoming exams count
    const subjects = await Subject.find({ department: student.department });
    const subjectIds = subjects.map((s) => s._id);
    const upcomingExamsCount = await Exam.countDocuments({
      subject: { $in: subjectIds },
      date: { $gte: new Date() },
    });

    // 5. Recent notifications
    const recentNotifications = await Notification.find({
      recipient: req.user!.id,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Today's Classes
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const todayClasses = await Timetable.find({
      department: student.department,
      semester: student.currentSemester,
      section: student.section,
      day: todayName,
    })
      .populate('subject', 'name code')
      .sort({ startTime: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        attendance: {
          percentage: attendancePercentage,
          total: totalClasses,
          present: presentClasses,
        },
        pendingAssignmentsCount,
        activeLibraryLoansCount,
        upcomingExamsCount,
        todayClasses,
        recentNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student Profile card details
 */
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = await Student.findOne({ user: req.user!.id })
      .populate('user', 'name email phoneNumber profileImage status')
      .populate('department', 'name code');

    if (!student) {
      next(new AppError('Student profile data not found.', 404));
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        student,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Profile details
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phoneNumber, profileImage } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user!.id,
      { phoneNumber, profileImage },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile information updated successfully.',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get overall subject-wise attendance logs
 */
export const getAttendance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = await getStudentOrThrow(req.user!.id);

    // Fetch student's course subjects
    const subjects = await Subject.find({ department: student.department });

    const attendanceSummary = [];

    for (const sub of subjects) {
      const total = await Attendance.countDocuments({
        student: student._id,
        subject: sub._id,
      });
      const present = await Attendance.countDocuments({
        student: student._id,
        subject: sub._id,
        status: { $in: ['Present', 'Late'] },
      });
      const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

      attendanceSummary.push({
        subjectId: sub._id,
        subjectName: sub.name,
        subjectCode: sub.code,
        credits: sub.credits,
        totalClasses: total,
        presentClasses: present,
        percentage,
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        attendanceSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Weekly Timetable grid
 */
export const getTimetable = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = await getStudentOrThrow(req.user!.id);

    const timetable = await Timetable.find({
      department: student.department,
      semester: student.currentSemester,
      section: student.section,
    }).populate('subject', 'name code');

    res.status(200).json({
      status: 'success',
      data: {
        timetable,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Assignments and submissions status
 */
export const getAssignments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = await getStudentOrThrow(req.user!.id);

    const assignments = await Assignment.find({
      semester: student.currentSemester,
      section: student.section,
    }).populate('subject', 'name code');

    const assignmentList = [];

    for (const asn of assignments) {
      const submission = await Submission.findOne({
        assignment: asn._id,
        student: student._id,
      });

      assignmentList.push({
        id: asn._id,
        title: asn.title,
        description: asn.description,
        subject: asn.subject,
        dueDate: asn.dueDate,
        maxMarks: asn.maxMarks,
        attachmentUrl: asn.attachmentUrl,
        submission: submission
          ? {
              submittedAt: submission.submittedAt,
              attachmentUrl: submission.attachmentUrl,
              grade: submission.grade,
              remarks: submission.remarks,
              status: submission.status,
            }
          : null,
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        assignments: assignmentList,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit assignment file link
 */
export const submitAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params; // Assignment ID
    const { attachmentUrl } = req.body;

    const student = await getStudentOrThrow(req.user!.id);

    // Verify assignment exists and corresponds to student's semester/section
    const assignment = await Assignment.findOne({
      _id: id,
      semester: student.currentSemester,
      section: student.section,
    });

    if (!assignment) {
      next(new AppError('Assignment not found or does not correspond to your section course.', 404));
      return;
    }

    // Submit or update existing submission
    const submission = await Submission.findOneAndUpdate(
      { assignment: id, student: student._id },
      { attachmentUrl, submittedAt: new Date(), status: 'Submitted' },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Assignment submitted successfully.',
      data: {
        submission,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Exams schedules
 */
export const getExams = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = await getStudentOrThrow(req.user!.id);

    const subjects = await Subject.find({ department: student.department });
    const subjectIds = subjects.map((s) => s._id);

    const exams = await Exam.find({
      subject: { $in: subjectIds },
    })
      .populate('subject', 'name code')
      .sort({ date: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        exams,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Semester Grades & Results transcripts
 */
export const getResults = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = await getStudentOrThrow(req.user!.id);

    const results = await Result.find({ student: student._id })
      .populate('subject', 'name code credits')
      .sort({ semester: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        results,
        academicPerformanceSummary: {
          cgpa: student.cgpa,
          creditsCompleted: student.creditsCompleted,
          currentSemester: student.currentSemester,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Library Borrowed Book Loans
 */
export const getLibrary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = await getStudentOrThrow(req.user!.id);

    const loans = await LibraryLoan.find({ student: student._id })
      .populate('book', 'title author isbn')
      .sort({ dueDate: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        loans,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get filed Complaints
 */
export const getComplaints = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = await getStudentOrThrow(req.user!.id);

    const complaints = await Complaint.find({ student: student._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        complaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * File new Complaint ticket
 */
export const createComplaint = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, category, description } = req.body;

    const student = await getStudentOrThrow(req.user!.id);

    const complaint = await Complaint.create({
      student: student._id,
      title,
      category,
      description,
    });

    res.status(201).json({
      status: 'success',
      message: 'Complaint ticket created successfully.',
      data: {
        complaint,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student Notifications
 */
export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = await getStudentOrThrow(req.user!.id);

    const notifications = await Notification.find({
      recipient: req.user!.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as Read
 */
export const readNotification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await getStudentOrThrow(req.user!.id);

    // Verify notification belongs to student or is global
    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user!.id,
    });

    if (!notification) {
      next(new AppError('Notification alert not found.', 404));
      return;
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      status: 'success',
      message: 'Notification alert updated.',
      data: {
        notification,
      },
    });
  } catch (error) {
    next(error);
  }
};
