import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import FormWrapper from '../components/ui/FormWrapper';
import PasswordInput from '../components/ui/PasswordInput';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setStatus('idle');
    setMessage(null);
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: data.password,
      });
      setStatus('success');
      setMessage(response.data.message || 'Your password has been changed.');
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to reset password. The link may have expired.');
    }
  };

  return (
    <FormWrapper
      title="Reset Password"
      subtitle="Define a secure password to restore access to your account"
    >
      {status === 'success' ? (
        <div className="flex flex-col gap-6 animate-fade-in">
          <Alert type="success" message={message || ''} />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 text-center">
            Redirecting to login portal...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {status === 'error' && message && <Alert type="error" message={message} />}

          <PasswordInput
            label="New Password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordInput
            label="Confirm New Password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
            Reset Password
          </Button>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-500 hover:text-primary-500 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </FormWrapper>
  );
};

export default ResetPassword;
