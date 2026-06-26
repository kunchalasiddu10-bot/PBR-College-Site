import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { createServer } from 'http';
import { connectDB } from './config/db';
import { env } from './config/env';
import { initSocketServer } from './services/socketService';

// Register all Mongoose schemas on startup
import './models/User';
import './models/Student';
import './models/Department';
import './models/Subject';
import './models/Timetable';
import './models/Attendance';
import './models/Assignment';
import './models/Submission';
import './models/Exam';
import './models/Result';
import './models/LibraryBook';
import './models/LibraryLoan';
import './models/Complaint';
import './models/Notification';
import './models/Event';
import './models/Course';
import './models/AcademicYear';
import './models/Semester';
import './models/Section';
import './models/FacultyAssignment';
import './models/Company';
import './models/Placement';
import './models/SystemSettings';
import './models/AuditLog';
import './models/AISession';
import './models/ChatHistory';
import './models/SavedPrompt';
import './models/UserPreferences';
import './models/Chat';
import './models/Message';
import './models/Announcement';
import './models/AnnouncementView';
import './models/UserNotificationPreferences';
import './models/StudyMaterial';

import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import adminRoutes from './routes/adminRoutes';
import aiRoutes from './routes/aiRoutes';
import notificationRoutes from './routes/notificationRoutes';
import announcementRoutes from './routes/announcementRoutes';
import chatRoutes from './routes/chatRoutes';
import facultyRoutes from './routes/facultyRoutes';
import hodRoutes from './routes/hodRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import AppError from './utils/AppError';
import { apiLimiter } from './middleware/rateLimiter';

const app = express();

// 1. Establish Database Connection
connectDB();

// 2. Global Middlewares
app.use(helmet()); // Secure HTTP headers

import { allowedOrigins } from './config/cors';

// Log allowed origins on startup for debugging
console.log('🌐 CORS allowed origins:', allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Required for cookies
  })
);
app.use(express.json({ limit: '10kb' })); // Limit body sizes to protect memory
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // Read cookie headers
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined')); // Request logging

// Apply rate limiting to all general API requests
app.use('/api/', apiLimiter);

// 3. API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/faculty', facultyRoutes);
app.use('/api/v1/hod', hodRoutes);

// Root test route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'CampusVerse AI Identity API is operational.',
  });
});

// 4. Handle Undefined Routes (404)
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.originalUrl} on this server`, 404));
});

// 5. Global Error Handling Middleware
app.use(errorHandler);

// Start the server
const port = env.PORT;
const httpServer = createServer(app);
initSocketServer(httpServer);

const server = httpServer.listen(port, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${port}`);
});

// Handle unhandled promise rejections outside of Express contexts
process.on('unhandledRejection', (err: Error) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down gracefully...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
