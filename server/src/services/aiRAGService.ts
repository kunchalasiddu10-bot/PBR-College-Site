import User from '../models/User';
import Student from '../models/Student';
import Attendance from '../models/Attendance';
import Timetable from '../models/Timetable';
import Exam from '../models/Exam';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import Result from '../models/Result';
import LibraryLoan from '../models/LibraryLoan';
import Event from '../models/Event';
import Complaint from '../models/Complaint';
import Placement from '../models/Placement';
import Subject from '../models/Subject';
import Department from '../models/Department';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface RAGRequest {
  userId: string;
  role: 'Student' | 'Faculty' | 'HOD' | 'Admin' | 'Visitor';
  question: string;
}

export const resolveDatabaseContext = async (req: RAGRequest): Promise<string> => {
  const query = req.question.toLowerCase().trim();
  const { role, userId } = req;

  try {
    // ----------------- STUDENT ROLE QUERIES -----------------
    if (role === 'Student') {
      const student = await Student.findOne({ user: userId }).populate('department', 'name code');
      if (!student) {
        return "I'm sorry, I couldn't find your Student Profile in the system database.";
      }

      // Intent: Attendance / Missed classes
      if (query.includes('attendance') || query.includes('missed class') || query.includes('classes missed')) {
        const total = await Attendance.countDocuments({ student: student._id });
        const present = await Attendance.countDocuments({ student: student._id, status: { $in: ['Present', 'Late'] } });
        const absent = await Attendance.countDocuments({ student: student._id, status: 'Absent' });
        const pct = total > 0 ? Math.round((present / total) * 100) : 100;

        if (query.includes('missed') || query.includes('absent')) {
          return `You have missed **${absent}** classes out of a total of ${total} sessions marked this term.`;
        }

        // Subject wise breakdown
        const subjects = await Subject.find({ department: student.department });
        const breakdown = [];
        for (const sub of subjects) {
          const sTotal = await Attendance.countDocuments({ student: student._id, subject: sub._id });
          const sPresent = await Attendance.countDocuments({ student: student._id, subject: sub._id, status: { $in: ['Present', 'Late'] } });
          const sPct = sTotal > 0 ? Math.round((sPresent / sTotal) * 100) : 100;
          breakdown.push(`- **${sub.name} (${sub.code})**: ${sPct}% (${sPresent}/${sTotal})`);
        }

        return `Your overall academic term attendance is **${pct}%** (${present} out of ${total} classes marked).\n\nHere is your subject-wise attendance breakdown:\n${breakdown.join('\n')}`;
      }

      // Intent: Timetable / Today schedule
      if (query.includes('timetable') || query.includes('schedule') || query.includes('class today') || query.includes('classes today')) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[new Date().getDay()];
        
        // Default to Monday if testing on weekend
        const lookupDay = todayName === 'Sunday' || todayName === 'Saturday' ? 'Monday' : todayName;

        const slots = await Timetable.find({
          department: student.department,
          semester: student.currentSemester,
          section: student.section,
          day: lookupDay,
        }).populate('subject', 'name code').sort({ startTime: 1 });

        if (slots.length === 0) {
          return `You have no scheduled classes on **${lookupDay}**. Enjoy your day!`;
        }

        const list = slots.map((s: any) => `- **${s.startTime} - ${s.endTime}**: ${s.subject?.name} (${s.subject?.code}) in Room ${s.room} with ${s.teacherName}`).join('\n');
        return `Here is your class timetable for **${lookupDay}**:\n\n${list}`;
      }

      // Intent: Exams
      if (query.includes('exam') || query.includes('test') || query.includes('midterm')) {
        const subjects = await Subject.find({ department: student.department });
        const subjectIds = subjects.map((s) => s._id);
        const exams = await Exam.find({
          subject: { $in: subjectIds },
          date: { $gte: new Date() },
        }).populate('subject', 'name code').sort({ date: 1 });

        if (exams.length === 0) {
          return "You have no upcoming semester exams scheduled in the database calendar.";
        }

        const list = exams.map((e: any) => `- **${e.subject?.name} (${e.subject?.code})**: ${new Date(e.date).toLocaleDateString()} | ${e.time} in ${e.room} (${e.type})`).join('\n');
        return `Here are your upcoming scheduled examinations:\n\n${list}`;
      }

      // Intent: Assignments
      if (query.includes('assignment') || query.includes('homework') || query.includes('pending')) {
        const assignments = await Assignment.find({
          semester: student.currentSemester,
          section: student.section,
        }).populate('subject', 'name code');

        const list = [];
        for (const asn of assignments) {
          const subm = await Submission.findOne({ student: student._id, assignment: asn._id });
          if (!subm) {
            list.push(`- **${asn.title}** (due ${new Date(asn.dueDate).toLocaleDateString()}): ${asn.description} (Max Marks: ${asn.maxMarks})`);
          }
        }

        if (list.length === 0) {
          return "Excellent! You have **no pending assignments** left to submit.";
        }

        return `Here are your pending course assignments:\n\n${list.join('\n')}`;
      }

      // Intent: CGPA / Grades
      if (query.includes('gpa') || query.includes('cgpa') || query.includes('grades') || query.includes('grade')) {
        const results = await Result.find({ student: student._id })
          .populate('subject', 'name code credits')
          .sort({ semester: 1 });

        if (results.length === 0) {
          return `Your profile lists your cumulative CGPA as **${student.cgpa || '0.00'}** with ${student.creditsCompleted} credits earned. No past semester transcripts are indexed.`;
        }

        const list = results.map((r: any) => `- **Sem ${r.semester}** | ${r.subject?.name} (${r.subject?.code}): Grade **${r.grade}** (Score: ${r.marksObtained}/100)`).join('\n');
        return `Your current cumulative CGPA is **${student.cgpa}** with **${student.creditsCompleted}** completed credits.\n\nHere are your past semester grades:\n\n${list}`;
      }

      // Intent: Library / Books
      if (query.includes('book') || query.includes('borrow') || query.includes('library')) {
        const loans = await LibraryLoan.find({ student: student._id, status: 'Issued' })
          .populate('book', 'title author isbn');

        if (loans.length === 0) {
          return "You have **no borrowed books** issued from the library catalog at this time.";
        }

        const list = loans.map((l: any) => `- **${l.book?.title}** by ${l.book?.author} (ISBN: ${l.book?.isbn}) - Due: ${new Date(l.dueDate).toLocaleDateString()}`).join('\n');
        return `You have **${loans.length}** books currently borrowed from the library:\n\n${list}`;
      }

      // Intent: Events
      if (query.includes('event') || query.includes('hackathon') || query.includes('workshop')) {
        const events = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 });
        if (events.length === 0) {
          return "There are no upcoming campus events scheduled this week.";
        }
        const list = events.map((ev) => `- **${ev.title}**: ${new Date(ev.date).toLocaleDateString()} at ${ev.venue} (Organizer: ${ev.organizer})`).join('\n');
        return `Here are the upcoming campus events:\n\n${list}`;
      }

      return "Hello! I can help you check your attendance rates, weekly class timetables, exam dates, library books, and pending assignments. What would you like to query today?";
    }

    // ----------------- FACULTY ROLE QUERIES -----------------
    if (role === 'Faculty' || role === 'HOD') {
      const user = await User.findById(userId);
      if (!user) return "Faculty identity records not found.";

      // Intent: Today's schedule
      if (query.includes('class') || query.includes('timetable') || query.includes('schedule')) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[new Date().getDay()];
        const lookupDay = todayName === 'Sunday' || todayName === 'Saturday' ? 'Monday' : todayName;

        // Search for slots mapping this faculty member's name
        const slots = await Timetable.find({
          teacherName: { $regex: user.name, $options: 'i' },
          day: lookupDay,
        }).populate('subject', 'name code');

        if (slots.length === 0) {
          return `You have no scheduled teaching classes on **${lookupDay}** in the database records.`;
        }

        const list = slots.map((s: any) => `- **${s.startTime} - ${s.endTime}**: ${s.subject?.name} for Sem ${s.semester} Section ${s.section} (LH: ${s.room})`).join('\n');
        return `Here is your scheduled teaching classes for **${lookupDay}**:\n\n${list}`;
      }

      // Intent: Assignments pending grading
      if (query.includes('grading') || query.includes('grade') || query.includes('submissions')) {
        const assignments = await Assignment.find().populate('subject', 'name code');
        const list = [];
        for (const asn of assignments) {
          const pendingCount = await Submission.countDocuments({ assignment: asn._id, status: 'Submitted' });
          if (pendingCount > 0) {
            list.push(`- **${asn.title}** (${(asn.subject as any)?.code}): **${pendingCount}** submissions pending grading.`);
          }
        }

        if (list.length === 0) {
          return "All student assignment submissions have been graded. No grading is pending!";
        }

        return `Here are the pending student submissions requiring grading:\n\n${list.join('\n')}`;
      }

      // Intent: Low attendance students
      if (query.includes('attendance') || query.includes('below 75%') || query.includes('low attendance')) {
        const studentsList = await Student.find().populate('user', 'name');
        const lowAttendance = [];
        for (const stud of studentsList) {
          const total = await Attendance.countDocuments({ student: stud._id });
          const present = await Attendance.countDocuments({ student: stud._id, status: { $in: ['Present', 'Late'] } });
          const pct = total > 0 ? (present / total) * 100 : 100;
          if (pct < 75) {
            lowAttendance.push(`- **${(stud.user as any)?.name}** (Roll: ${stud.rollNumber}): **${Math.round(pct)}%** (${present}/${total} classes)`);
          }
        }

        if (lowAttendance.length === 0) {
          return "Excellent! All enrolled students have attendance levels at or above 75%.";
        }

        return `Here are the students currently below the minimum 75% attendance threshold:\n\n${lowAttendance.join('\n')}`;
      }

      return `Hello Professor ${user.name.split(' ').slice(1).join(' ')}! I can list your teaching class schedules, show students with attendance below 75%, and check pending assignment grading. What would you like to inquire about?`;
    }

    // ----------------- ADMIN ROLE QUERIES -----------------
    if (role === 'Admin') {
      // Intent: Student and Faculty counts
      if (query.includes('enrolled') || query.includes('student count') || query.includes('how many students')) {
        const studCount = await Student.countDocuments();
        const facCount = await User.countDocuments({ role: { $in: ['Faculty', 'HOD'] } });
        return `There are currently **${studCount}** students enrolled and **${facCount}** faculty members registered in the CampusVerse ERP database.`;
      }

      // Intent: Department attendance summary
      if (query.includes('attendance')) {
        const depts = await Department.find();
        const summary = [];
        for (const d of depts) {
          const studentIds = (await Student.find({ department: d._id })).map((s) => s._id);
          const total = await Attendance.countDocuments({ student: { $in: studentIds } });
          const present = await Attendance.countDocuments({ student: { $in: studentIds }, status: { $in: ['Present', 'Late'] } });
          const pct = total > 0 ? Math.round((present / total) * 100) : 100;
          summary.push(`- **${d.name} (${d.code})**: **${pct}%** (${present}/${total} records)`);
        }
        return `Here is the department-wise attendance index summary:\n\n${summary.join('\n')}`;
      }

      // Intent: Placements
      if (query.includes('placement') || query.includes('hired') || query.includes('jobs')) {
        const placements = await Placement.find().populate('company', 'name');
        let selectedCount = 0;
        const driveSummaries = [];
        for (const p of placements) {
          const sel = p.applicants.filter((a) => a.status === 'Selected').length;
          selectedCount += sel;
          driveSummaries.push(`- **${(p.company as any)?.name || 'Partner Company'}** (${p.jobTitle}): ${sel} students hired.`);
        }
        return `A total of **${selectedCount}** students have been successfully placed in the ongoing campus placement drives.\n\nSummary of drives:\n\n${driveSummaries.join('\n')}`;
      }

      // Intent: Complaints
      if (query.includes('complaint') || query.includes('complaints') || query.includes('tickets')) {
        const pending = await Complaint.countDocuments({ status: { $in: ['Pending', 'In-Progress'] } });
        const resolved = await Complaint.countDocuments({ status: 'Resolved' });
        return `Complaint ticket summary:\n- **Pending & In-Progress**: ${pending} tickets\n- **Resolved**: ${resolved} tickets`;
      }

      return "Welcome, Administrator. I can fetch ERP registries, count enrollments, retrieve placement ratios, show complaints statuses, and calculate department attendance ratios.";
    }

    return "I am the campus ERP assistant. Please login to query customized dashboard parameters.";
  } catch (error: any) {
    console.error('RAG Query error:', error);
    return `I encountered a local database error fetching that details: ${error.message}`;
  }
};

export const processRAGQuery = async (req: RAGRequest): Promise<string> => {
  try {
    // 1. Resolve live database records context
    const dbContext = await resolveDatabaseContext(req);

    // 2. Check for Gemini API key configuration
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('💡 [AI RAG Service] process.env.GEMINI_API_KEY is not set. Falling back to local offline query generator.');
      return dbContext;
    }

    // 3. Initialize Google Generative AI client
    console.log('🤖 [AI RAG Service] Querying Gemini AI in real-time...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 4. Construct prompt
    const prompt = `You are a universal real-time AI assistant for the CampusVerse College ERP.
User Role: ${req.role}
User ID: ${req.userId}

Here is the context of live records retrieved from the college database relevant to the user's query:
--------------------
${dbContext}
--------------------

The user is asking: "${req.question}"

Please answer the user's question. Guidelines:
1. If the user's question is about their college records (attendance, classes, exams, assignments, library books, placements, complaints, HOD details), prioritize and base your answer directly on the live database context provided.
2. If the user's question is a general doubt, educational question (e.g. math, coding, science), general greeting, or general conversation not related to college records, act as a universal, highly knowledgeable chatbot and explain the answer comprehensively, accurately, and politely.
3. Strictly do not invent or hallucinate any personal college records (grades, attendance percentages, section names) if they are not present in the database context. For general knowledge or academic concepts, feel free to use your broader base of knowledge to explain fully.
4. Keep the response clean and format it nicely in Markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text || dbContext;
  } catch (error: any) {
    console.error('⚠️ [AI RAG Service] Gemini API call failed. Falling back to offline context:', error);
    // Return database context directly as fallback
    return await resolveDatabaseContext(req);
  }
};
