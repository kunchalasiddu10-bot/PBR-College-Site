import { z } from 'zod';

export const createComplaintSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Complaint title is required' })
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title cannot exceed 100 characters'),
    category: z.enum(['Academic', 'Hostel', 'Infrastructure', 'Finance', 'Other'], {
      required_error: 'Category is required',
    }),
    description: z.string({ required_error: 'Description details are required' })
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description cannot exceed 1000 characters'),
  }),
});

export const submitAssignmentSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Assignment ID param is required' }),
  }),
  body: z.object({
    attachmentUrl: z.string({ required_error: 'Attachment URL is required' })
      .url('Please provide a valid file submission link URL'),
  }),
});

export const updateStudentProfileSchema = z.object({
  body: z.object({
    phoneNumber: z.string().optional(),
    profileImage: z.string().url('Invalid profile image URL format').optional().or(z.literal('')),
  }),
});
