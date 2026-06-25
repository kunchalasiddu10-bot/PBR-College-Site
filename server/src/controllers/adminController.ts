import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import Student from '../models/Student';
import Department from '../models/Department';
import Subject from '../models/Subject';
import Course from '../models/Course';
import AcademicYear from '../models/AcademicYear';
import Semester from '../models/Semester';
import Section from '../models/Section';
import FacultyAssignment from '../models/FacultyAssignment';
import Company from '../models/Company';
import Placement from '../models/Placement';
import LibraryBook from '../models/LibraryBook';
import LibraryLoan from '../models/LibraryLoan';
import Complaint from '../models/Complaint';
import Notification from '../models/Notification';
import Event from '../models/Event';
import SystemSettings from '../models/SystemSettings';
import AuditLog from '../models/AuditLog';
import Timetable from '../models/Timetable';
import Attendance from '../models/Attendance';
import AppError from '../utils/AppError';
import { logAudit } from '../utils/auditLogger';
import { triggerNotification } from '../utils/notificationHelper';

/**
 * Get Admin Dashboard Overview stats
 */
export const getDashboardSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await User.countDocuments({ role: { $in: ['Faculty', 'HOD'] } });
    const totalDepartments = await Department.countDocuments();
    const totalCourses = await Course.countDocuments();
    const activeSemesters = await Semester.countDocuments({ status: 'Active' });
    const libraryBooks = await LibraryBook.countDocuments();
    const activeLoans = await LibraryLoan.countDocuments({ status: 'Issued' });
    const upcomingEvents = await Event.countDocuments({ date: { $gte: new Date() } });

    // Placement drive stats
    const totalDrives = await Placement.countDocuments();
    const placements = await Placement.find();
    let totalSelected = 0;
    placements.forEach((p) => {
      p.applicants.forEach((a) => {
        if (a.status === 'Selected') totalSelected++;
      });
    });

    // Complaint summaries
    const pendingComplaints = await Complaint.countDocuments({ status: { $in: ['Pending', 'In-Progress'] } });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });

    // Recent system activity logs
    const recentActivity = await AuditLog.find()
      .populate('user', 'name role')
      .sort({ timestamp: -1 })
      .limit(6);

    // Mock CPU/Memory health statistics
    const memoryUsage = process.memoryUsage();
    const systemHealth = {
      uptime: Math.round(process.uptime()),
      memory: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB / ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      status: 'Healthy',
      nodeVersion: process.version,
    };

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalStudents,
          totalFaculty,
          totalDepartments,
          totalCourses,
          activeSemesters,
          library: {
            books: libraryBooks,
            activeLoans,
          },
          upcomingEvents,
          placements: {
            drives: totalDrives,
            selected: totalSelected,
          },
          complaints: {
            pending: pendingComplaints,
            resolved: resolvedComplaints,
          },
        },
        recentActivity,
        systemHealth,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- STUDENTS MANAGEMENT -----------------
 */

export const getStudents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const department = req.query.department as string;

    const query: any = {};

    if (department) {
      query.department = department;
    }

    let studentProfileQuery = Student.find(query)
      .populate({
        path: 'user',
        select: 'name email phoneNumber status profileImage',
      })
      .populate('department', 'name code');

    // If search text is present, we must match Student's roll number or User's name/email
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
        role: 'Student',
      }).select('_id');

      const userIds = users.map((u) => u._id);
      query.$or = [
        { rollNumber: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } },
        { user: { $in: userIds } },
      ];
      studentProfileQuery = Student.find(query)
        .populate({
          path: 'user',
          select: 'name email phoneNumber status profileImage',
        })
        .populate('department', 'name code');
    }

    const students = await studentProfileQuery.skip(skip).limit(limit);
    const total = await Student.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        students,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, rollNumber, admissionNumber, department, currentSemester, section, academicYear } = req.body;

    // Check duplicate roll number or admission number
    const existingRoll = await Student.findOne({ rollNumber });
    if (existingRoll) {
      throw new AppError('Roll number already exists.', 400);
    }
    const existingAdm = await Student.findOne({ admissionNumber });
    if (existingAdm) {
      throw new AppError('Admission number already exists.', 400);
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email address already registered.', 400);
    }

    // 1. Create linked User account
    const user = await User.create({
      name,
      email,
      password,
      role: 'Student',
      emailVerified: true,
    });

    // 2. Create Student Profile
    const student = await Student.create({
      user: user._id,
      rollNumber,
      admissionNumber,
      department,
      currentSemester,
      section,
      academicYear,
    });

    await logAudit(req, 'CREATE_STUDENT', `Created student profile for ${name} (${rollNumber})`);

    res.status(201).json({
      status: 'success',
      message: 'Student account and profile created successfully.',
      data: { student },
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, rollNumber, admissionNumber, department, currentSemester, section, academicYear, status } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      throw new AppError('Student profile not found.', 404);
    }

    // Update User account
    const userUpdates: any = {};
    if (name) userUpdates.name = name;
    if (email) userUpdates.email = email;
    if (status) userUpdates.status = status;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(student.user, userUpdates);
    }

    // Update Student details
    if (rollNumber) student.rollNumber = rollNumber;
    if (admissionNumber) student.admissionNumber = admissionNumber;
    if (department) student.department = department;
    if (currentSemester) student.currentSemester = currentSemester;
    if (section) student.section = section;
    if (academicYear) student.academicYear = academicYear;

    await student.save();
    await logAudit(req, 'UPDATE_STUDENT', `Updated student profile for ${name || student.rollNumber}`);

    res.status(200).json({
      status: 'success',
      message: 'Student profile updated successfully.',
      data: { student },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      throw new AppError('Student profile not found.', 404);
    }

    // Delete associated User account
    await User.findByIdAndDelete(student.user);
    // Delete Student profile
    await Student.findByIdAndDelete(id);

    await logAudit(req, 'DELETE_STUDENT', `Deleted student profile for roll number: ${student.rollNumber}`);

    res.status(200).json({
      status: 'success',
      message: 'Student record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const suspendStudent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Suspended' | 'Active'

    const student = await Student.findById(id);
    if (!student) {
      throw new AppError('Student profile not found.', 404);
    }

    await User.findByIdAndUpdate(student.user, { status });
    await logAudit(req, 'SUSPEND_STUDENT', `Set student status to ${status} for roll: ${student.rollNumber}`);

    res.status(200).json({
      status: 'success',
      message: `Student status updated to ${status} successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

export const resetStudentPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      throw new AppError('Student profile not found.', 404);
    }

    // Fetch user and save (to trigger pre-save password hash)
    const userDoc = await User.findById(student.user);
    if (!userDoc) {
      throw new AppError('User login not found.', 404);
    }

    userDoc.password = password || 'Password@123';
    await userDoc.save();

    await logAudit(req, 'RESET_PASSWORD', `Reset password of student roll: ${student.rollNumber}`);

    res.status(200).json({
      status: 'success',
      message: 'Student password reset successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const importStudents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { students } = req.body; // Array of students
    if (!students || !Array.isArray(students)) {
      throw new AppError('Invalid import format. Expected array.', 400);
    }

    let successCount = 0;
    for (const s of students) {
      try {
        const user = await User.create({
          name: s.name,
          email: s.email,
          password: s.password || 'Password@123',
          role: 'Student',
          emailVerified: true,
        });

        await Student.create({
          user: user._id,
          rollNumber: s.rollNumber,
          admissionNumber: s.admissionNumber,
          department: s.department,
          currentSemester: s.currentSemester || 1,
          section: s.section || 'A',
          academicYear: s.academicYear,
        });
        successCount++;
      } catch (err) {
        // Skip duplicates or errored records and continue bulk import
      }
    }

    await logAudit(req, 'IMPORT_STUDENTS', `Bulk imported ${successCount} student profiles`);

    res.status(201).json({
      status: 'success',
      message: `Bulk import complete. Registered ${successCount}/${students.length} students.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- FACULTY MANAGEMENT -----------------
 */

export const getFaculty = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = req.query.search as string;
    const query: any = { role: { $in: ['Faculty', 'HOD'] } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const faculty = await User.find(query).select('name email department role status lastLogin createdAt');

    // Fetch assignments count for each faculty member
    const facultyList = [];
    for (const f of faculty) {
      const assignmentsCount = await FacultyAssignment.countDocuments({ faculty: f._id });
      facultyList.push({
        ...f.toObject(),
        assignmentsCount,
      });
    }

    res.status(200).json({
      status: 'success',
      data: { faculty: facultyList },
    });
  } catch (error) {
    next(error);
  }
};

export const createFaculty = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, department, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered.', 400);
    }

    const faculty = await User.create({
      name,
      email,
      password,
      role: role || 'Faculty',
      department,
      emailVerified: true,
    });

    await logAudit(req, 'CREATE_FACULTY', `Created faculty account: ${name} (${email})`);

    res.status(201).json({
      status: 'success',
      message: 'Faculty account created successfully.',
      data: { faculty },
    });
  } catch (error) {
    next(error);
  }
};

export const updateFaculty = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, department, role, status } = req.body;

    const faculty = await User.findById(id);
    if (!faculty || !['Faculty', 'HOD'].includes(faculty.role)) {
      throw new AppError('Faculty account not found.', 404);
    }

    if (name) faculty.name = name;
    if (email) faculty.email = email;
    if (department) faculty.department = department;
    if (role) faculty.role = role;
    if (status) faculty.status = status;

    await faculty.save();
    await logAudit(req, 'UPDATE_FACULTY', `Updated faculty account details: ${faculty.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Faculty details updated successfully.',
      data: { faculty },
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateFaculty = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Disabled' | 'Active'

    const faculty = await User.findById(id);
    if (!faculty || !['Faculty', 'HOD'].includes(faculty.role)) {
      throw new AppError('Faculty account not found.', 404);
    }

    faculty.status = status;
    await faculty.save();

    await logAudit(req, 'DEACTIVATE_FACULTY', `Set status to ${status} for faculty: ${faculty.email}`);

    res.status(200).json({
      status: 'success',
      message: `Faculty account status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

export const assignSubjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { facultyId, subjectId, sectionId, academicYearId } = req.body;

    const assignment = await FacultyAssignment.create({
      faculty: facultyId,
      subject: subjectId,
      section: sectionId,
      academicYear: academicYearId,
    });

    await logAudit(req, 'ASSIGN_SUBJECT', `Assigned subject ${subjectId} to faculty ${facultyId}`);

    res.status(201).json({
      status: 'success',
      message: 'Subject and class assigned to Faculty member successfully.',
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- DEPARTMENTS MANAGEMENT -----------------
 */

export const getDepartments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const depts = await Department.find();
    const deptsList = [];

    for (const d of depts) {
      const studentCount = await Student.countDocuments({ department: d._id });
      const subjectCount = await Subject.countDocuments({ department: d._id });
      // HOD details
      const hodUser = await User.findOne({ department: d.code, role: 'HOD' }).select('name email');

      deptsList.push({
        ...d.toObject(),
        studentCount,
        subjectCount,
        hod: hodUser || null,
      });
    }

    res.status(200).json({
      status: 'success',
      data: { departments: deptsList },
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, code, description } = req.body;

    const dept = await Department.create({ name, code, description });
    await logAudit(req, 'CREATE_DEPARTMENT', `Created department ${code}: ${name}`);

    res.status(201).json({
      status: 'success',
      data: { department: dept },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const dept = await Department.findByIdAndUpdate(
      id,
      { name, code, description },
      { new: true, runValidators: true }
    );

    if (!dept) throw new AppError('Department not found', 404);

    await logAudit(req, 'UPDATE_DEPARTMENT', `Updated department ${dept.code}`);

    res.status(200).json({
      status: 'success',
      data: { department: dept },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const dept = await Department.findByIdAndDelete(id);

    if (!dept) throw new AppError('Department not found', 404);

    await logAudit(req, 'DELETE_DEPARTMENT', `Deleted department ${dept.code}`);

    res.status(200).json({
      status: 'success',
      message: 'Department deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const assignHOD = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { departmentCode, facultyId } = req.body;

    // Set new HOD role
    await User.findByIdAndUpdate(facultyId, { role: 'HOD', department: departmentCode });
    await logAudit(req, 'ASSIGN_HOD', `Assigned user ${facultyId} as HOD for department ${departmentCode}`);

    res.status(200).json({
      status: 'success',
      message: 'HOD assigned successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- COURSES & SUBJECTS -----------------
 */

export const getCourses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courses = await Course.find().populate('department', 'name code');
    res.status(200).json({
      status: 'success',
      data: { courses },
    });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, code, description, credits, department, durationYears } = req.body;
    const course = await Course.create({ name, code, description, credits, department, durationYears });

    await logAudit(req, 'CREATE_COURSE', `Created course ${code}`);

    res.status(201).json({
      status: 'success',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subjects = await Subject.find().populate('department', 'name code');
    res.status(200).json({
      status: 'success',
      data: { subjects },
    });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, code, credits, department } = req.body;
    const subject = await Subject.create({ name, code, credits, department });

    await logAudit(req, 'CREATE_SUBJECT', `Created subject ${code}`);

    res.status(201).json({
      status: 'success',
      data: { subject },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- ACADEMIC STRUCTURE -----------------
 */

export const getAcademicYears = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const years = await AcademicYear.find().sort({ name: -1 });
    res.status(200).json({
      status: 'success',
      data: { academicYears: years },
    });
  } catch (error) {
    next(error);
  }
};

export const createAcademicYear = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, startDate, endDate, status } = req.body;
    const year = await AcademicYear.create({ name, startDate, endDate, status });

    await logAudit(req, 'CREATE_ACADEMIC_YEAR', `Created academic year ${name}`);

    res.status(201).json({
      status: 'success',
      data: { academicYear: year },
    });
  } catch (error) {
    next(error);
  }
};

export const getSemesters = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const semesters = await Semester.find().populate('academicYear', 'name');
    res.status(200).json({
      status: 'success',
      data: { semesters },
    });
  } catch (error) {
    next(error);
  }
};

export const createSemester = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { academicYear, semesterNumber, startDate, endDate, status } = req.body;
    const sem = await Semester.create({ academicYear, semesterNumber, startDate, endDate, status });

    await logAudit(req, 'CREATE_SEMESTER', `Created semester ${semesterNumber}`);

    res.status(201).json({
      status: 'success',
      data: { semester: sem },
    });
  } catch (error) {
    next(error);
  }
};

export const getSections = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sections = await Section.find()
      .populate('course', 'name code')
      .populate('academicYear', 'name');
    res.status(200).json({
      status: 'success',
      data: { sections },
    });
  } catch (error) {
    next(error);
  }
};

export const createSection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, course, semester, capacity, academicYear } = req.body;
    const sec = await Section.create({ name, course, semester, capacity, academicYear });

    await logAudit(req, 'CREATE_SECTION', `Created section ${name} for semester ${semester}`);

    res.status(201).json({
      status: 'success',
      data: { section: sec },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- LIBRARY MANAGEMENT -----------------
 */

export const getBooks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const books = await LibraryBook.find();
    res.status(200).json({
      status: 'success',
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};

export const createBook = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, author, isbn, availableCopies } = req.body;
    const book = await LibraryBook.create({ title, author, isbn, availableCopies });

    await logAudit(req, 'CREATE_LIBRARY_BOOK', `Added library book: ${title}`);

    res.status(201).json({
      status: 'success',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- PLACEMENT MANAGEMENT -----------------
 */

export const getCompanies = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companies = await Company.find();
    res.status(200).json({
      status: 'success',
      data: { companies },
    });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, industry, description, website, contactEmail, contactPhone } = req.body;
    const comp = await Company.create({ name, industry, description, website, contactEmail, contactPhone });

    await logAudit(req, 'CREATE_COMPANY', `Added placement company ${name}`);

    res.status(201).json({
      status: 'success',
      data: { company: comp },
    });
  } catch (error) {
    next(error);
  }
};

export const getPlacementDrives = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const drives = await Placement.find().populate('company', 'name industry website');
    res.status(200).json({
      status: 'success',
      data: { placementDrives: drives },
    });
  } catch (error) {
    next(error);
  }
};

export const createPlacementDrive = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId, jobTitle, jobDescription, package: salaryPackage, eligibilityCriteria, driveDate } = req.body;
    const drive = await Placement.create({
      company: companyId,
      jobTitle,
      jobDescription,
      package: salaryPackage,
      eligibilityCriteria,
      driveDate,
    });

    await logAudit(req, 'CREATE_PLACEMENT_DRIVE', `Created placement drive for ${jobTitle}`);

    res.status(201).json({
      status: 'success',
      data: { placementDrive: drive },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlacementApplicant = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params; // Placement Drive ID
    const { studentId, status, roundReached } = req.body;

    const drive = await Placement.findById(id);
    if (!drive) throw new AppError('Placement drive not found', 404);

    const applicant = drive.applicants.find((a) => a.student.toString() === studentId);
    if (applicant) {
      applicant.status = status;
      if (roundReached) applicant.roundReached = roundReached;
    } else {
      drive.applicants.push({
        student: studentId,
        status,
        roundReached: roundReached || 'Applied',
        appliedAt: new Date(),
      } as any);
    }

    await drive.save();
    await logAudit(req, 'UPDATE_PLACEMENT_APPLICANT', `Updated student ${studentId} status to ${status} for drive ${id}`);

    // Send real-time notification to the student
    const studentDoc = await Student.findById(studentId);
    if (studentDoc) {
      await triggerNotification({
        recipientId: studentDoc.user.toString(),
        title: 'Placement Drive Update',
        message: `Your application status for the job "${drive.jobTitle}" has been updated to "${status}".`,
        type: 'Placement',
        metadata: { placementDriveId: drive._id.toString(), status }
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Applicant status updated successfully.',
      data: { placementDrive: drive },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- COMPLAINT MANAGEMENT -----------------
 */

export const getComplaints = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const complaints = await Complaint.find().populate({
      path: 'student',
      populate: { path: 'user', select: 'name email rollNumber' },
    });
    res.status(200).json({
      status: 'success',
      data: { complaints },
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (
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
      { new: true, runValidators: true }
    );

    if (!complaint) throw new AppError('Complaint not found', 404);

    await logAudit(req, 'UPDATE_COMPLAINT', `Updated complaint status to ${status} for ticket ${id}`);

    // Send real-time notification to the student
    const studentDoc = await Student.findById(complaint.student);
    if (studentDoc) {
      await triggerNotification({
        recipientId: studentDoc.user.toString(),
        title: 'Complaint Status Updated',
        message: `Your complaint "${complaint.title}" status has been updated to "${status}"${remarks ? ` with remarks: "${remarks}"` : ''}.`,
        type: 'Complaint',
        metadata: { complaintId: complaint._id.toString(), status }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { complaint },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- ANNOUNCEMENTS -----------------
 */

export const createAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, message, type } = req.body;

    const announce = await Notification.create({
      student: null, // null represents global
      title,
      message,
      type: type || 'Academic',
    });

    await logAudit(req, 'CREATE_ANNOUNCEMENT', `Created system announcement: ${title}`);

    res.status(201).json({
      status: 'success',
      data: { notification: announce },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- SYSTEM SETTINGS -----------------
 */

export const getSystemSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.status(200).json({
      status: 'success',
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSystemSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create(req.body);
    } else {
      settings = await SystemSettings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    await logAudit(req, 'UPDATE_SETTINGS', 'Updated college ERP system settings');

    res.status(200).json({
      status: 'success',
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- AUDIT LOGGING -----------------
 */

export const getAuditLogs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json({
      status: 'success',
      data: { auditLogs: logs },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- MISSING ACADEMIC MANAGEMENT CRUD -----------------
 */

import Assignment from '../models/Assignment';
import Result from '../models/Result';
import Exam from '../models/Exam';

// Timetables
export const getAdminTimetables = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const timetables = await Timetable.find().populate('subject', 'name code').populate('department', 'name code');
    res.status(200).json({ status: 'success', data: { timetables } });
  } catch (error) { next(error); }
};

export const createAdminTimetable = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const timetable = await Timetable.create(req.body);
    await logAudit(req, 'CREATE_TIMETABLE', `Created timetable entry for day ${req.body.day}`);
    res.status(201).json({ status: 'success', data: { timetable } });
  } catch (error) { next(error); }
};

export const deleteAdminTimetable = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    await logAudit(req, 'DELETE_TIMETABLE', `Deleted timetable entry ${req.params.id}`);
    res.status(200).json({ status: 'success', message: 'Timetable entry deleted.' });
  } catch (error) { next(error); }
};

// Attendance
export const getAdminAttendances = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attendances = await Attendance.find().populate('student').populate('subject', 'name code');
    res.status(200).json({ status: 'success', data: { attendances } });
  } catch (error) { next(error); }
};

export const createAdminAttendance = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).json({ status: 'success', data: { attendance } });
  } catch (error) { next(error); }
};

// Assignments
export const getAdminAssignments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assignments = await Assignment.find().populate('subject', 'name code');
    res.status(200).json({ status: 'success', data: { assignments } });
  } catch (error) { next(error); }
};

export const createAdminAssignment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json({ status: 'success', data: { assignment } });
  } catch (error) { next(error); }
};

// Exams
export const getAdminExams = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exams = await Exam.find().populate('subject', 'name code');
    res.status(200).json({ status: 'success', data: { exams } });
  } catch (error) { next(error); }
};

export const createAdminExam = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json({ status: 'success', data: { exam } });
  } catch (error) { next(error); }
};

// Results
export const getAdminResults = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const results = await Result.find().populate('student').populate('subject', 'name code');
    res.status(200).json({ status: 'success', data: { results } });
  } catch (error) { next(error); }
};

export const createAdminResult = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await Result.create(req.body);
    res.status(201).json({ status: 'success', data: { result } });
  } catch (error) { next(error); }
};

