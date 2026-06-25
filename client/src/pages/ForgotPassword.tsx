import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import FormWrapper from '../components/ui/FormWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setStatus('idle');
    setMessage(null);
    try {
      const response = await api.post('/auth/forgot-password', { email: data.email });
      setStatus('success');
      setMessage(response.data.message || 'Check your terminal console. A mock password reset URL has been logged.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Something went wrong. Please check your inputs and try again.');
    }
  };

  return (
    <FormWrapper
      title="Recover Password"
      subtitle="Enter your email address and we'll dispatch a link to reset your credentials"
    >
      {status === 'success' ? (
        <div className="flex flex-col gap-6 animate-fade-in">
          <Alert type="success" message={message || ''} />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Note: Since we are using mock notification pipelines during local builds, the reset URL has been printed to the server terminal console logs.
          </p>
          <Link to="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {status === 'error' && message && <Alert type="error" message={message} />}

          <Input
            label="College Email Address"
            type="email"
            placeholder="yourname@college.edu"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
            Send Reset Instructions
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

export default ForgotPassword;
