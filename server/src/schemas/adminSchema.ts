import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email'),
    password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
    rollNumber: z.string({ required_error: 'Roll number is required' }),
    admissionNumber: z.string({ required_error: 'Admission number is required' }),
    department: z.string({ required_error: 'Department ID is required' }),
    currentSemester: z.number().min(1).max(8).default(1),
    section: z.string({ required_error: 'Section is required' }).min(1).max(2),
    academicYear: z.string({ required_error: 'Academic year is required' }),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    rollNumber: z.string().optional(),
    admissionNumber: z.string().optional(),
    department: z.string().optional(),
    currentSemester: z.number().min(1).max(8).optional(),
    section: z.string().min(1).max(2).optional(),
    academicYear: z.string().optional(),
    status: z.enum(['Active', 'Disabled', 'Suspended']).optional(),
  }),
});

export const createFacultySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email'),
    password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
    department: z.string({ required_error: 'Department name/code is required' }),
  }),
});

export const updateFacultySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    department: z.string().optional(),
    status: z.enum(['Active', 'Disabled', 'Suspended']).optional(),
  }),
});

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Department name is required' }).min(2),
    code: z.string({ required_error: 'Department code is required' }).min(2).max(10),
    description: z.string().optional().default(''),
  }),
});

export const createCourseSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Course name is required' }),
    code: z.string({ required_error: 'Course code is required' }),
    credits: z.number({ required_error: 'Credits are required' }).min(1),
    department: z.string({ required_error: 'Department ID is required' }),
    durationYears: z.number().min(1).default(4),
  }),
});

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Subject name is required' }),
    code: z.string({ required_error: 'Subject code is required' }),
    credits: z.number({ required_error: 'Credits are required' }).min(1),
    department: z.string({ required_error: 'Department ID is required' }),
  }),
});

export const createAcademicYearSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Academic Year name is required' }), // e.g. 2024-2025
    startDate: z.string({ required_error: 'Start Date is required' }),
    endDate: z.string({ required_error: 'End Date is required' }),
    status: z.enum(['Active', 'Inactive']).optional().default('Active'),
  }),
});

export const createSemesterSchema = z.object({
  body: z.object({
    academicYear: z.string({ required_error: 'Academic Year ID is required' }),
    semesterNumber: z.number({ required_error: 'Semester Number is required' }).min(1).max(8),
    startDate: z.string({ required_error: 'Start Date is required' }),
    endDate: z.string({ required_error: 'End Date is required' }),
    status: z.enum(['Active', 'Inactive']).optional().default('Active'),
  }),
});

export const createSectionSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Section Name is required' }),
    course: z.string({ required_error: 'Course ID is required' }),
    semester: z.number({ required_error: 'Semester is required' }).min(1).max(8),
    capacity: z.number().min(1).default(60),
    academicYear: z.string({ required_error: 'Academic Year ID is required' }),
  }),
});

export const createPlacementSchema = z.object({
  body: z.object({
    companyId: z.string({ required_error: 'Company ID is required' }),
    jobTitle: z.string({ required_error: 'Job title is required' }),
    jobDescription: z.string({ required_error: 'Job description is required' }),
    package: z.string({ required_error: 'Salary package is required' }),
    eligibilityCriteria: z.string({ required_error: 'Eligibility criteria is required' }),
    driveDate: z.string({ required_error: 'Drive date is required' }),
    status: z.enum(['Upcoming', 'Ongoing', 'Completed']).optional().default('Upcoming'),
  }),
});

export const updatePlacementApplicantSchema = z.object({
  body: z.object({
    studentId: z.string({ required_error: 'Student ID is required' }),
    status: z.enum(['Applied', 'Shortlisted', 'Selected', 'Rejected']),
    roundReached: z.string().optional(),
  }),
});

export const createLibraryBookSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    author: z.string({ required_error: 'Author is required' }),
    isbn: z.string({ required_error: 'ISBN is required' }),
    availableCopies: z.number().min(0).default(1),
  }),
});
