import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HelpCircle, Send } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const complaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  category: z.enum(['Academic', 'Hostel', 'Infrastructure', 'Finance', 'Other']),
  description: z.string().min(10, 'Details must be at least 10 characters').max(1000, 'Details cannot exceed 1000 characters'),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

export const StudentComplaints: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: '',
      category: 'Infrastructure',
      description: '',
    },
  });

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/complaints');
      setComplaints(response.data.data.complaints);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const onSubmit = async (data: ComplaintFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const response = await api.post('/student/complaints', data);
      setSubmitSuccess('Ticket submitted successfully. It will be assigned to a support technician shortly.');
      reset();
      
      // Update list locally
      setComplaints((prev) => [response.data.data.complaint, ...prev]);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit complaint.');
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading complaints center...</p>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} className="max-w-2xl mx-auto" />;
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Complaints & Support
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          File support tickets for infrastructure, finance, or academic issues and track their progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ticket Submission Form (Span 1) */}
        <div className="p-6 rounded-3xl glass-card space-y-6 h-fit">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-white">File New Ticket</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {submitError && <Alert type="error" message={submitError} />}
            {submitSuccess && <Alert type="success" message={submitSuccess} />}

            <Input
              label="Subject / Title"
              placeholder="Brief description of the issue"
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Category
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-xs font-bold text-slate-800 dark:text-slate-100"
                {...register('category')}
              >
                <option value="Academic">Academic</option>
                <option value="Hostel">Hostel</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detailed Description
              </label>
              <textarea
                rows={4}
                placeholder="Describe the issue, include block details, room numbers, or transactions where relevant..."
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-xs font-semibold text-slate-800 dark:text-slate-100"
                {...register('description')}
              />
              {errors.description?.message && (
                <span className="text-xs text-red-500 font-semibold animate-fade-in">
                  {errors.description.message}
                </span>
              )}
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              <Send className="h-4 w-4" /> Submit Ticket
            </Button>
          </form>
        </div>

        {/* Tickets List (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Active Support Tickets</h3>

          <div className="flex flex-col gap-4">
            {complaints.length === 0 ? (
              <div className="p-12 text-center rounded-3xl glass-card space-y-4">
                <div className="mx-auto h-12 w-12 bg-slate-100 dark:bg-slate-850 rounded-2xl flex items-center justify-center text-slate-400">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <p className="text-sm font-extrabold text-slate-800 dark:text-white">No Tickets Found</p>
                <p className="text-xs text-slate-400">You haven't filed any support complaints.</p>
              </div>
            ) : (
              complaints.map((ticket) => {
                const statusColors = {
                  'Open': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
                  'In-Progress': 'bg-primary-500/10 text-primary-500',
                  'Resolved': 'bg-green-500/10 text-green-600 dark:text-green-400',
                };

                return (
                  <div key={ticket._id} className="p-6 rounded-3xl glass-card space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                          Ticket ID: {ticket._id.substring(18).toUpperCase()} • {ticket.category}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                          {ticket.title}
                        </h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${statusColors[ticket.status as 'Open' | 'In-Progress' | 'Resolved']}`}>
                        {ticket.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                      {ticket.description}
                    </p>

                    {ticket.status === 'Resolved' && ticket.resolutionDetails && (
                      <div className="p-4 rounded-2xl bg-green-500/5 dark:bg-green-950/10 border border-green-500/20 text-xs text-green-800 dark:text-green-300 font-medium leading-relaxed">
                        <span className="font-extrabold text-[10px] uppercase tracking-wider block mb-1 text-green-600">RESOLUTION REMARKS:</span>
                        "{ticket.resolutionDetails}"
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                      <span>Submitted on: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span>Last updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default StudentComplaints;
