import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Mail, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const profileUpdateSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number cannot exceed 15 digits'),
  profileImage: z.string().url('Please enter a valid image URL').or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileUpdateSchema>;

export const StudentProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      phoneNumber: '',
      profileImage: '',
    },
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/profile');
      const profileData = response.data.data.student;
      setStudent(profileData);
      
      // Seed update form fields
      setValue('phoneNumber', profileData.user?.phoneNumber || '');
      setValue('profileImage', profileData.user?.profileImage || '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onSubmit = async (data: ProfileFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const response = await api.patch('/student/profile', data);
      setSubmitSuccess('Profile information updated successfully.');
      
      // Update local student profile state
      setStudent((prev: any) => ({
        ...prev,
        user: {
          ...prev.user,
          phoneNumber: response.data.data.user.phoneNumber,
          profileImage: response.data.data.user.profileImage,
        },
      }));
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading profile card...</p>
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
          Student Profile Card
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Review academic registration records and update personal contact information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card Summary Details (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Visual Profile Header Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-40%] right-[-10%] w-64 h-64 rounded-full bg-primary-500/10 blur-[80px]" />

            <div className="h-24 w-24 rounded-3xl bg-white/10 border-2 border-white/20 overflow-hidden flex items-center justify-center text-3xl font-extrabold text-white uppercase shrink-0">
              {student.user?.profileImage ? (
                <img src={student.user.profileImage} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                student.user?.name[0]
              )}
            </div>

            <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
              <h2 className="text-2xl font-extrabold truncate">{student.user?.name}</h2>
              <p className="text-sm font-semibold text-primary-400">{student.department?.name}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {student.user?.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {student.user?.phoneNumber || 'No phone registered'}</span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> {student.user?.status}
            </span>
          </div>

          {/* Academic Profile Details */}
          <div className="p-6 rounded-3xl glass-card space-y-6">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Academic Ledger</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roll Number</p>
                <p className="text-base font-extrabold text-slate-800 dark:text-white">{student.rollNumber}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admission Number</p>
                <p className="text-base font-extrabold text-slate-800 dark:text-white">{student.admissionNumber}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Section & Class</p>
                <p className="text-base font-extrabold text-slate-800 dark:text-white">Semester {student.currentSemester} Section {student.section}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Period</p>
                <p className="text-base font-extrabold text-slate-800 dark:text-white">{student.academicYear}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Edit Form (Span 1) */}
        <div className="p-6 rounded-3xl glass-card space-y-6 h-fit">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-white">Update Contact Details</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {submitError && <Alert type="error" message={submitError} />}
            {submitSuccess && <Alert type="success" message={submitSuccess} />}

            <Input
              label="Contact Phone Number"
              placeholder="e.g. +91 98765 43210"
              error={errors.phoneNumber?.message}
              {...register('phoneNumber')}
            />

            <Input
              label="Profile Avatar URL"
              placeholder="https://image-bucket-url/avatar.jpg"
              error={errors.profileImage?.message}
              {...register('profileImage')}
            />

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Save Changes
            </Button>
          </form>
        </div>

      </div>
      
    </div>
  );
};

export default StudentProfile;
