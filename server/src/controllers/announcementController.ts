import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Announcement from '../models/Announcement';
import AnnouncementView from '../models/AnnouncementView';
import Student from '../models/Student';
import AppError from '../utils/AppError';
import { broadcastToRoom } from '../services/socketService';

/**
 * Get targeted announcements feed based on user role and segment
 */
export const getAnnouncements = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const filter: any = { status: 'published', scheduledFor: { $lte: new Date() } };

    if (user.role === 'Student') {
      const student = await Student.findOne({ user: user.id }).populate('department');
      if (student) {
        const deptCode = student.department ? (student.department as any).code : null;
        const semester = student.currentSemester;
        const section = student.section;

        // Build target audience filter query
        filter.$and = [
          {
            $or: [
              { 'targetAudience.department': null },
              { 'targetAudience.department': deptCode },
            ],
          },
          {
            $or: [
              { 'targetAudience.semester': null },
              { 'targetAudience.semester': semester },
            ],
          },
          {
            $or: [
              { 'targetAudience.section': null },
              { 'targetAudience.section': section },
            ],
          },
        ];
      }
    } else if (user.role === 'Faculty' || user.role === 'HOD') {
      // HOD and Faculty see everything or targeted to their department
      filter.$or = [
        { 'targetAudience.department': null },
        { 'targetAudience.department': user.department },
      ];
    }

    const announcements = await Announcement.find(filter)
      .populate('author', 'name role profileImage')
      .sort({ isPinned: -1, scheduledFor: -1 });

    // Fetch view status for each announcement for this user
    const announcementIds = announcements.map((a) => a._id);
    const viewedRecords = await AnnouncementView.find({
      announcement: { $in: announcementIds },
      user: user.id,
    });
    const viewedIds = new Set(viewedRecords.map((vr) => vr.announcement.toString()));

    const feeds = announcements.map((a) => {
      const aObj = a.toObject();
      return {
        ...aObj,
        isRead: viewedIds.has(a._id.toString()),
      };
    });

    res.status(200).json({
      status: 'success',
      data: { announcements: feeds },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new announcement (Admin/Faculty/HOD only)
 */
export const createAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    
    // Check role authorization
    if (!['Admin', 'Faculty', 'HOD'].includes(user.role)) {
      throw new AppError('Unauthorized: Only administrative and faculty roles can post announcements', 403);
    }

    const { title, content, attachments, scheduledFor, targetAudience, isPinned } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      author: user.id,
      attachments: attachments || [],
      scheduledFor: scheduledFor || new Date(),
      targetAudience: targetAudience || { department: null, semester: null, section: null },
      isPinned: isPinned || false,
      status: 'published',
    });

    // Populate author details for response and sockets
    const populated = await announcement.populate('author', 'name role profileImage');

    // Broadcast notice instantly via WS targeting relevant room channels
    const dept = targetAudience?.department;
    const sem = targetAudience?.semester;
    const sec = targetAudience?.section;

    const payload = {
      event: 'announcement:new',
      announcement: populated,
    };

    if (dept && sem && sec) {
      // Targets specific section classroom room
      broadcastToRoom(`class:${sem}:${sec}`, 'announcement:new', payload);
    } else if (dept) {
      // Targets specific department room
      broadcastToRoom(`dept:${dept}`, 'announcement:new', payload);
    } else {
      // Broadcasts to all connected rooms
      broadcastToRoom('all', 'announcement:new', payload);
    }

    res.status(201).json({
      status: 'success',
      data: { announcement: populated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Edit, Pin, Archive an announcement (Admin/Faculty/HOD author checks)
 */
export const updateAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!['Admin', 'Faculty', 'HOD'].includes(user.role)) {
      throw new AppError('Unauthorized access', 403);
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }

    // Faculty can only edit their own announcements; Admin can edit anything
    if (user.role !== 'Admin' && announcement.author.toString() !== user.id) {
      throw new AppError('Access denied: You can only edit announcements you authored', 403);
    }

    const { title, content, attachments, status, isPinned, targetAudience } = req.body;

    const updated = await Announcement.findByIdAndUpdate(
      id,
      { title, content, attachments, status, isPinned, targetAudience },
      { new: true, runValidators: true }
    ).populate('author', 'name role profileImage');

    // Broadcast update
    broadcastToRoom('all', 'announcement:updated', { announcement: updated });

    res.status(200).json({
      status: 'success',
      data: { announcement: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark an announcement as read / viewed by a user
 */
export const viewAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Track view unique constraint checks
    await AnnouncementView.findOneAndUpdate(
      { announcement: id, user: userId },
      { viewedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(250).json({
      status: 'success',
      message: 'Announcement read status recorded.',
    });
  } catch (error) {
    next(error);
  }
};
