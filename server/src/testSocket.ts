import 'dotenv/config';
import { io } from 'socket.io-client';
import mongoose from 'mongoose';
import User from './models/User';
import Student from './models/Student';
import Complaint from './models/Complaint';
import Placement from './models/Placement';

const BASE_URL = 'http://localhost:5000/api/v1';
const SOCKET_URL = 'http://localhost:5000';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runTests = async () => {
  console.log('🏁 Starting Real-Time WebSockets Integration Tests...');

  let studentSocket: any = null;
  let adminSocket: any = null;

  try {
    // 1. Authenticate users
    console.log('➡️ Authenticating Admin and Student...');
    const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@college.edu', password: 'Password@123' }),
    });
    const adminData: any = await adminLogin.json();
    const adminToken = adminData.data.accessToken;

    const studentLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@college.edu', password: 'Password@123' }),
    });
    const studentData: any = await studentLogin.json();
    const studentToken = studentData.data.accessToken;
    const studentId = studentData.data.user.id;

    console.log('✅ Authentication complete.');

    // 2. Establish Socket Connection for Student
    console.log('➡️ Establishing authenticated Socket.IO connection for Student...');
    studentSocket = io(SOCKET_URL, {
      auth: { token: studentToken },
      autoConnect: true,
    });

    const studentNotifications: any[] = [];
    const studentAnnouncements: any[] = [];

    studentSocket.on('connect', () => {
      console.log('🔌 Student Socket Connected.');
    });

    studentSocket.on('notification', (notif: any) => {
      console.log(`🔔 [Student Socket] Received notification: "${notif.title}" - ${notif.message}`);
      studentNotifications.push(notif);
    });

    studentSocket.on('announcement:new', (payload: any) => {
      console.log(`📣 [Student Socket] Received announcement: "${payload.announcement.title}"`);
      studentAnnouncements.push(payload.announcement);
    });

    // 3. Establish Socket Connection for Admin
    console.log('➡️ Establishing authenticated Socket.IO connection for Admin...');
    adminSocket = io(SOCKET_URL, {
      auth: { token: adminToken },
      autoConnect: true,
    });

    adminSocket.on('connect', () => {
      console.log('🔌 Admin Socket Connected.');
    });

    // Wait for connection handshakes
    await sleep(2000);

    // Connect to DB to fetch seeded IDs
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusverse-ai');
    
    // Find Student Profile ID
    const studentProfile = await Student.findOne({ user: studentId });
    if (!studentProfile) throw new Error('Student profile not found');

    // 4. Test Case 1: Post targeted Announcement (Admin)
    console.log('➡️ Testing Targeted Announcement dispatch...');
    const announceRes = await fetch(`${BASE_URL}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Mid-term Exams Rescheduled',
        content: 'Mid-term exams for Semester 3 are postponed by one week.',
        isPinned: true,
        targetAudience: {
          department: 'CSE',
          semester: 3,
          section: 'A',
        },
      }),
    });
    
    const announceData: any = await announceRes.json();
    if (announceRes.status !== 201) {
      throw new Error(`Failed to create announcement: ${announceData.message}`);
    }
    console.log('✅ Announcement posted. Waiting for socket dispatch...');
    await sleep(1500);

    // 5. Test Case 2: Update Complaint Status (Admin)
    console.log('➡️ Testing Complaint status notification...');
    // Create a mock complaint first
    const mockComplaint = await Complaint.create({
      student: studentProfile._id,
      title: 'Water cooler not working in LH-201',
      category: 'Infrastructure',
      description: 'The water cooler has been down since yesterday.',
      status: 'Open',
    });

    const complaintRes = await fetch(`${BASE_URL}/admin/complaints/${mockComplaint._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'Resolved',
        remarks: 'Water cooler compressor replaced. Working fine now.',
      }),
    });

    const complaintData: any = await complaintRes.json();
    if (complaintRes.status !== 200) {
      throw new Error(`Failed to update complaint: ${complaintData.message}`);
    }
    console.log('✅ Complaint status updated on REST API.');
    await sleep(1500);

    // Clean up mock complaint
    await Complaint.findByIdAndDelete(mockComplaint._id);

    // 6. Test Case 3: Invalid token handshake check
    console.log('➡️ Testing Invalid token socket validation...');
    const invalidSocket = io(SOCKET_URL, {
      auth: { token: 'invalid-or-expired-jwt-token' },
      autoConnect: true,
    });

    let connectErrorThrown = false;
    await new Promise<void>((resolve) => {
      invalidSocket.on('connect_error', (err) => {
        console.log(`✅ Handshake correctly rejected: ${err.message}`);
        connectErrorThrown = true;
        invalidSocket.disconnect();
        resolve();
      });
      setTimeout(() => {
        invalidSocket.disconnect();
        resolve();
      }, 3000);
    });

    if (!connectErrorThrown) {
      throw new Error('Socket server accepted an invalid handshake token!');
    }

    // 7. Verify all socket messages arrived successfully
    console.log('➡️ Verifying socket events delivery checklist...');
    if (studentAnnouncements.length === 0) {
      throw new Error('Student socket did not receive the new announcement broadcast!');
    }
    if (studentNotifications.length === 0) {
      throw new Error('Student socket did not receive the complaint status update alert!');
    }

    console.log('🎉 All Real-Time Socket integration tests passed successfully!');
    cleanup(studentSocket, adminSocket);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Real-Time WebSockets Integration Tests Failed:', error.message || error);
    cleanup(studentSocket, adminSocket);
    process.exit(1);
  }
};

const cleanup = (ws1: any, ws2: any) => {
  if (ws1) ws1.disconnect();
  if (ws2) ws2.disconnect();
  mongoose.disconnect();
};

runTests();
