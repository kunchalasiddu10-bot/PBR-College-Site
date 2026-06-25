import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import FacultyAssignment from '../models/FacultyAssignment';
import Student from '../models/Student';
import User from '../models/User';
import Subject from '../models/Subject';
import Section from '../models/Section';
import Timetable from '../models/Timetable';
import Attendance from '../models/Attendance';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import Result from '../models/Result';
import StudyMaterial from '../models/StudyMaterial';
import AppError from '../utils/AppError';
import { sendRealTimeNotification } from '../services/socketService';
import Notification from '../models/Notification';

/**
 * Get Faculty Dashboard Summary
 */
export const getDashboardSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const facultyId = req.user!.id;
    const user = await User.findById(facultyId);
    if (!user) {
      throw new AppError('Faculty user profile not found', 404);
    }

    // 1. Get assigned sections and subjects
    const assignments = await FacultyAssignment.find({ faculty: facultyId })
      .populate('subject')
      .populate('section');

    const subjectIds = assignments.map((a: any) => a.subject?._id).filter(Boolean);
    const sectionNames = assignments.map((a: any) => a.section?.name).filter(Boolean);

    // 2. Total students in assigned sections
    const totalStudents = await Student.countDocuments({
      section: { $in: sectionNames }
    });

    // 3. Pending assignments to grade
    const facultyAssignments = await Assignment.find({
      subject: { $in: subjectIds }
    });
    const assignmentIds = facultyAssignments.map((a) => a._id);
    const pendingGradingCount = await Submission.countDocuments({
      assignment: { $in: assignmentIds },
      status: 'Submitted'
    });

    // 4. Low attendance alerts count (< 75%)
    let lowAttendanceCount = 0;
    if (subjectIds.length > 0) {
      const students = await Student.find({ section: { $in: sectionNames } });
      for (const student of students) {
        for (const subId of subjectIds) {
          const total = await Attendance.countDocuments({ student: student._id, subject: subId });
          if (total > 0) {
            const present = await Attendance.countDocuments({
              student: student._id,
              subject: subId,
              status: { $in: ['Present', 'Late'] }
            });
            if ((present / total) * 100 < 75) {
              lowAttendanceCount++;
            }
          }
        }
      }
    }

    // 5. Today's Classes
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const todayClasses = await Timetable.find({
      teacherName: { $regex: new RegExp(user.name, 'i') },
      day: todayName
    }).populate('subject', 'name code');

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalStudents,
          assignedSubjects: subjectIds.length,
          pendingGradingCount,
          lowAttendanceCount
        },
        todayClasses,
        assignments: assignments.map((a: any) => ({
          id: a._id,
          subject: a.subject,
          section: a.section,
          academicYear: a.academicYear
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Faculty Timetable
 */
export const getTimetable = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new AppError('User profile not found', 404);
    }

    const timetable = await Timetable.find({
      teacherName: { $regex: new RegExp(user.name, 'i') }
    }).populate('subject', 'name code');

    res.status(200).json({
      status: 'success',
      data: {
        timetable
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List Students in Assigned Sections
 */
export const getStudents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const facultyId = req.user!.id;
    const assignments = await FacultyAssignment.find({ faculty: facultyId })
      .populate('section');
    const sectionNames = assignments.map((a: any) => a.section?.name).filter(Boolean);

    const students = await Student.find({
      section: { $in: sectionNames }
    }).populate('user', 'name email phoneNumber profileImage status');

    res.status(200).json({
      status: 'success',
      data: {
        students
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Assigned Classes
 */
export const getAssignedClasses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assignments = await FacultyAssignment.find({ faculty: req.user!.id })
      .populate('subject')
      .populate('section')
      .populate('academicYear');

    res.status(200).json({
      status: 'success',
      data: {
        assignments
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assignments CRUD
 */
export const getAssignments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assignments = await FacultyAssignment.find({ faculty: req.user!.id });
    const subjectIds = assignments.map((a) => a.subject);

    const facultyAssignments = await Assignment.find({
      subject: { $in: subjectIds }
    }).populate('subject', 'name code');

    res.status(200).json({
      status: 'success',
      data: {
        assignments: facultyAssignments
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, subject, section, semester, dueDate, maxMarks, attachmentUrl } = req.body;

    const assignment = await Assignment.create({
      title,
      description,
      subject,
      section,
      semester,
      dueDate,
      maxMarks,
      attachmentUrl
    });

    // Notify all students in this class section
    const students = await Student.find({ section, currentSemester: semester });
    for (const student of students) {
      const notif = await Notification.create({
        recipient: student.user,
        title: `New Assignment: ${title}`,
        message: `An assignment has been posted for subject code in semester ${semester} section ${section}.`,
        type: 'Assignment'
      });
      sendRealTimeNotification(student.user.toString(), notif);
    }

    res.status(201).json({
      status: 'success',
      message: 'Assignment posted and students notified successfully.',
      data: {
        assignment
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      });

    res.status(200).json({
      status: 'success',
      data: {
        submissions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { grade, remarks } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { grade, remarks, status: 'Graded' },
      { new: true }
    ).populate({
      path: 'student',
      populate: { path: 'user' }
    });

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    // Notify student
    const notif = await Notification.create({
      recipient: (submission.student as any).user._id,
      title: 'Assignment Graded',
      message: `Your submission has been graded. Grade: ${grade}. Remarks: ${remarks}`,
      type: 'Assignment'
    });
    sendRealTimeNotification((submission.student as any).user._id.toString(), notif);

    res.status(200).json({
      status: 'success',
      message: 'Submission graded successfully.',
      data: {
        submission
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk Attendance
 */
export const markAttendance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { subjectId, semester, section, date, attendanceData } = req.body;
    // attendanceData is array of { studentId, status }

    const results = [];
    for (const record of attendanceData) {
      const attendance = await Attendance.findOneAndUpdate(
        {
          student: record.studentId,
          subject: subjectId,
          date: new Date(date),
          semester
        },
        { status: record.status },
        { new: true, upsert: true }
      );
      results.push(attendance);

      // Notify student of absence/late entry
      if (record.status === 'Absent') {
        const studentRecord = await Student.findById(record.studentId);
        if (studentRecord) {
          const notif = await Notification.create({
            recipient: studentRecord.user,
            title: 'Attendance Shortage Alert',
            message: `You were marked ABSENT for subject on date: ${new Date(date).toLocaleDateString()}`,
            type: 'Attendance'
          });
          sendRealTimeNotification(studentRecord.user.toString(), notif);
        }
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Attendance register submitted successfully.',
      data: {
        results
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk Post Exam Results
 */
export const postResults = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { subjectId, semester, examType, resultsData } = req.body;
    // resultsData is array of { studentId, marksObtained, maxMarks, grade }

    const results = [];
    for (const r of resultsData) {
      const result = await Result.findOneAndUpdate(
        {
          student: r.studentId,
          subject: subjectId,
          semester,
          examType
        },
        {
          marksObtained: r.marksObtained,
          maxMarks: r.maxMarks,
          grade: r.grade
        },
        { new: true, upsert: true }
      );
      results.push(result);

      // Notify student
      const studentRecord = await Student.findById(r.studentId);
      if (studentRecord) {
        const notif = await Notification.create({
          recipient: studentRecord.user,
          title: 'Exam Result Declared',
          message: `Results for ${examType} have been posted. Your Grade: ${r.grade}`,
          type: 'Result'
        });
        sendRealTimeNotification(studentRecord.user.toString(), notif);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Grades and results posted successfully.',
      data: {
        results
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Study Materials Management
 */
export const getStudyMaterials = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const materials = await StudyMaterial.find({ uploadedBy: req.user!.id })
      .populate('subject', 'name code')
      .populate('section', 'name');

    res.status(200).json({
      status: 'success',
      data: {
        materials
      }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadStudyMaterial = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, subject, section, semester, fileUrl } = req.body;

    const material = await StudyMaterial.create({
      title,
      description,
      subject,
      section,
      semester,
      fileUrl,
      uploadedBy: req.user!.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Study resources uploaded successfully.',
      data: {
        material
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudyMaterial = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const material = await StudyMaterial.findOneAndDelete({ _id: id, uploadedBy: req.user!.id });
    if (!material) {
      throw new AppError('Study material not found or unauthorized to delete', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Study resource deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
