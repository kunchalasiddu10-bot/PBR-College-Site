import mongoose from 'mongoose';
import User from '../models/User';
import Student from '../models/Student';
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
import { connectDB } from '../config/db';

const seedUsers = [
  {
    name: 'System Administrator',
    email: 'admin@college.edu',
    password: 'Password@123',
    role: 'Admin',
    department: 'IT',
    emailVerified: true,
  },
  {
    name: 'Dr. Jane Smith',
    email: 'hod@college.edu',
    password: 'Password@123',
    role: 'HOD',
    department: 'Computer Science',
    emailVerified: true,
  },
  {
    name: 'Prof. Alex Mercer',
    email: 'faculty@college.edu',
    password: 'Password@123',
    role: 'Faculty',
    department: 'Computer Science',
    emailVerified: true,
  },
  {
    name: 'John Doe',
    email: 'student@college.edu',
    password: 'Password@123',
    role: 'Student',
    department: 'Computer Science',
    phoneNumber: '9876543210',
    emailVerified: true,
  },
  {
    name: 'Guest Explorer',
    email: 'visitor@college.edu',
    password: 'Password@123',
    role: 'Visitor',
    emailVerified: true,
  },
];

const runSeed = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing all collections...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Department.deleteMany({});
    await Subject.deleteMany({});
    await Timetable.deleteMany({});
    await Attendance.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    await Exam.deleteMany({});
    await Result.deleteMany({});
    await LibraryBook.deleteMany({});
    await LibraryLoan.deleteMany({});
    await Complaint.deleteMany({});
    await Notification.deleteMany({});
    await Event.deleteMany({});

    console.log('🌱 Seeding user accounts...');
    const usersMap: any = {};
    for (const u of seedUsers) {
      const user = await User.create(u);
      usersMap[u.email] = user;
      console.log(`✅ Seeded User [${u.role}]: ${u.email}`);
    }

    console.log('🌱 Seeding Departments...');
    const cseDept = await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science and Engineering',
    });
    console.log(`✅ Seeded Department: ${cseDept.name}`);

    console.log('🌱 Seeding Student Profile...');
    const studentUser = usersMap['student@college.edu'];
    const studentProfile = await Student.create({
      user: studentUser._id,
      rollNumber: 'CS2024001',
      admissionNumber: 'ADM-2024-9988',
      department: cseDept._id,
      currentSemester: 3,
      section: 'A',
      cgpa: 8.7,
      creditsCompleted: 42,
      academicYear: '2024-2028',
    });
    console.log(`✅ Seeded Student Profile for: ${studentUser.name}`);

    console.log('🌱 Seeding Subjects...');
    const subjectsData = [
      { name: 'Operating Systems', code: 'CS301', credits: 4, department: cseDept._id },
      { name: 'Database Management Systems', code: 'CS302', credits: 4, department: cseDept._id },
      { name: 'Web Technologies', code: 'CS303', credits: 3, department: cseDept._id },
      { name: 'Computer Networks', code: 'CS304', credits: 4, department: cseDept._id },
      { name: 'Formal Languages & Automata', code: 'CS305', credits: 3, department: cseDept._id },
    ];
    const subjectsMap: any = {};
    for (const sub of subjectsData) {
      const subject = await Subject.create(sub);
      subjectsMap[sub.code] = subject;
      console.log(`✅ Seeded Subject: ${sub.name} (${sub.code})`);
    }

    console.log('🌱 Seeding Weekly Timetable...');
    const timetableData = [
      // Monday
      { day: 'Monday', subject: subjectsMap['CS301']._id, startTime: '09:00', endTime: '09:50', room: 'LH-201', teacherName: 'Prof. Alex Mercer' },
      { day: 'Monday', subject: subjectsMap['CS302']._id, startTime: '10:00', endTime: '10:50', room: 'LH-201', teacherName: 'Dr. Jane Smith' },
      { day: 'Monday', subject: subjectsMap['CS303']._id, startTime: '11:10', endTime: '12:00', room: 'Lab 3', teacherName: 'Prof. Alex Mercer' },
      // Tuesday
      { day: 'Tuesday', subject: subjectsMap['CS304']._id, startTime: '09:00', endTime: '09:50', room: 'LH-201', teacherName: 'Dr. Sarah Connor' },
      { day: 'Tuesday', subject: subjectsMap['CS305']._id, startTime: '10:00', endTime: '10:50', room: 'LH-201', teacherName: 'Prof. Charles Xavier' },
      // Wednesday
      { day: 'Wednesday', subject: subjectsMap['CS301']._id, startTime: '09:00', endTime: '09:50', room: 'LH-201', teacherName: 'Prof. Alex Mercer' },
      { day: 'Wednesday', subject: subjectsMap['CS302']._id, startTime: '10:00', endTime: '10:50', room: 'LH-201', teacherName: 'Dr. Jane Smith' },
      // Thursday
      { day: 'Thursday', subject: subjectsMap['CS303']._id, startTime: '09:00', endTime: '09:50', room: 'Lab 3', teacherName: 'Prof. Alex Mercer' },
      { day: 'Thursday', subject: subjectsMap['CS304']._id, startTime: '10:00', endTime: '10:50', room: 'LH-201', teacherName: 'Dr. Sarah Connor' },
      // Friday
      { day: 'Friday', subject: subjectsMap['CS305']._id, startTime: '09:00', endTime: '09:50', room: 'LH-201', teacherName: 'Prof. Charles Xavier' },
      { day: 'Friday', subject: subjectsMap['CS301']._id, startTime: '10:00', endTime: '10:50', room: 'LH-201', teacherName: 'Prof. Alex Mercer' },
    ];
    for (const slot of timetableData) {
      await Timetable.create({
        ...slot,
        department: cseDept._id,
        semester: 3,
        section: 'A',
      });
    }
    console.log('✅ Seeded Timetable classes');

    console.log('🌱 Seeding Attendance logs...');
    // Create attendance logs for past 10 days for each subject
    const attendanceStatuses: ('Present' | 'Absent' | 'Late')[] = ['Present', 'Present', 'Present', 'Absent', 'Present', 'Present', 'Present', 'Present', 'Late', 'Present'];
    for (const subCode of Object.keys(subjectsMap)) {
      const subject = subjectsMap[subCode];
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        // Exclude sundays
        if (date.getDay() !== 0) {
          await Attendance.create({
            student: studentProfile._id,
            subject: subject._id,
            date,
            status: attendanceStatuses[(i + subCode.charCodeAt(2)) % attendanceStatuses.length],
            semester: 3,
          });
        }
      }
    }
    console.log('✅ Seeded Attendance logs');

    console.log('🌱 Seeding Assignments & Submissions...');
    const assignment1 = await Assignment.create({
      title: 'Design OS Process Scheduler',
      description: 'Implement a preemptive priority scheduling algorithm simulation in C/C++.',
      subject: subjectsMap['CS301']._id,
      section: 'A',
      semester: 3,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      maxMarks: 50,
      attachmentUrl: 'https://college-resources.s3.amazonaws.com/CS301/OS_Assignment1.pdf',
    });

    const assignment2 = await Assignment.create({
      title: 'Database Normalization Task',
      description: 'Normalize the given schema into 3NF and BCNF. Submit SQL statements.',
      subject: subjectsMap['CS302']._id,
      section: 'A',
      semester: 3,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      maxMarks: 30,
      attachmentUrl: 'https://college-resources.s3.amazonaws.com/CS302/normalization_problems.pdf',
    });

    // Student has submitted the past DB assignment
    await Submission.create({
      assignment: assignment2._id,
      student: studentProfile._id,
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      attachmentUrl: 'https://student-submissions.s3.amazonaws.com/CS2024001/CS302_Normalization_Submit.pdf',
      grade: 'A',
      remarks: 'Excellent normalization breakdown and clean SQL schemas.',
      status: 'Graded',
    });
    console.log('✅ Seeded Assignments and submissions');

    console.log('🌱 Seeding Exam Schedules...');
    await Exam.create({
      subject: subjectsMap['CS301']._id,
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      time: '10:00 AM - 01:00 PM',
      room: 'LH-305',
      type: 'Semester End',
    });
    await Exam.create({
      subject: subjectsMap['CS302']._id,
      date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
      time: '10:00 AM - 01:00 PM',
      room: 'LH-305',
      type: 'Semester End',
    });
    console.log('✅ Seeded Exam Schedules');

    console.log('🌱 Seeding Grade Results (Past Semesters)...');
    const pastResults = [
      // Semester 1
      { subjectName: 'Mathematics I', code: 'MTH101', credits: 4, marks: 88, grade: 'A', sem: 1 },
      { subjectName: 'Programming in C', code: 'CS101', credits: 4, marks: 92, grade: 'O', sem: 1 },
      { subjectName: 'Digital Logic Design', code: 'CS102', credits: 3, marks: 74, grade: 'B', sem: 1 },
      // Semester 2
      { subjectName: 'Data Structures & Algorithms', code: 'CS201', credits: 4, marks: 95, grade: 'O', sem: 2 },
      { subjectName: 'Object Oriented Programming', code: 'CS202', credits: 3, marks: 86, grade: 'A', sem: 2 },
      { subjectName: 'Discrete Mathematics', code: 'MTH201', credits: 4, marks: 81, grade: 'A', sem: 2 },
    ];
    for (const r of pastResults) {
      // Create transient subject records just to link in results
      let sub = await Subject.findOne({ code: r.code });
      if (!sub) {
        sub = await Subject.create({
          name: r.subjectName,
          code: r.code,
          credits: r.credits,
          department: cseDept._id,
        });
      }
      await Result.create({
        student: studentProfile._id,
        subject: sub._id,
        semester: r.sem,
        examType: 'Semester End',
        marksObtained: r.marks,
        maxMarks: 100,
        grade: r.grade,
      });
    }
    console.log('✅ Seeded past grade transcripts');

    console.log('🌱 Seeding Library Catalog & Loans...');
    const book1 = await LibraryBook.create({
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Thomas H. Cormen',
      isbn: '9780262033848',
      availableCopies: 5,
    });
    const book2 = await LibraryBook.create({
      title: 'Operating System Concepts',
      author: 'Silberschatz & Galvin',
      isbn: '9781118063330',
      availableCopies: 3,
    });

    await LibraryLoan.create({
      student: studentProfile._id,
      book: book1._id,
      issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days due
      status: 'Issued',
    });
    console.log('✅ Seeded library loans');

    console.log('🌱 Seeding Student Complaint Tickets...');
    await Complaint.create({
      student: studentProfile._id,
      title: 'Extremely Slow Wi-Fi in Hostel block B',
      category: 'Infrastructure',
      description: 'The Wi-Fi speeds in Room 305 of Hostel block B are consistently below 1Mbps, making it impossible to download lecture notes or attend online labs.',
      status: 'In-Progress',
    });
    console.log('✅ Seeded complaints');

    console.log('🌱 Seeding Notifications & Announcements...');
    await Notification.create({
      recipient: studentUser._id,
      title: 'Assignment Posted: Design OS Process Scheduler',
      message: 'A new assignment has been uploaded in Operating Systems (CS301). Due date is 5 days from now.',
      type: 'Assignment',
    });
    await Notification.create({
      recipient: studentUser._id,
      title: 'Annual College Hackathon 2026 Registration Open',
      message: 'Register your teams for Hackverse-2026 happening on July 15th. Cash prizes up to $5,000.',
      type: 'Events',
    });
    console.log('✅ Seeded notification alerts');

    console.log('🌱 Seeding Campus Events...');
    await Event.create({
      title: 'Campus Hackverse 2026',
      description: 'A 36-hour national level programming hackathon focusing on AI-based edtech solutions.',
      date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      venue: 'Main Auditorium Hall A',
      organizer: 'CSE Club',
    });
    await Event.create({
      title: 'Guest Lecture: Future of Quantum Computing',
      description: 'A research lecture by Dr. Robert Vance from MIT on quantum algorithms and hardware scaling.',
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      venue: 'Seminar Hall 3',
      organizer: 'Research Cell',
    });
    console.log('✅ Seeded campus events');

    console.log('🎉 Full database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exit(1);
  }
};

runSeed();
