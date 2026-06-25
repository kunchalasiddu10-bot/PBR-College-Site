import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormWrapper from '../components/ui/FormWrapper';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Read target path from router navigation state (if redirected from ProtectedRoute)
  const from = location.state?.from?.pathname;

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);
    setSuccessMsg(null);
    try {
      await login(data.email, data.password);
      setSuccessMsg('Logged in successfully! Redirecting...');
      
      // Artificial delay for smooth UX transition
      setTimeout(() => {
        // Dynamic role checking to redirect pathing
        // Prioritize routing user to the target path they initially attempted to access
        if (from) {
          navigate(from, { replace: true });
          return;
        }

        // Default role redirects
        // We will fetch the role directly from user storage context
        navigate('/redirect-handler', { replace: true });
      }, 1000);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to authenticate. Please try again.';
      setApiError(msg);
    }
  };

  return (
    <FormWrapper
      title="Welcome Back"
      subtitle="Enter your credentials to access your CampusVerse portal"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {apiError && <Alert type="error" message={apiError} />}
        {successMsg && <Alert type="success" message={successMsg} />}

        <Input
          label="Email Address"
          type="email"
          placeholder="name@college.edu"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="flex flex-col gap-1">
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="text-right mt-1">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
          Sign In
        </Button>

        <div className="text-center mt-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Visitor looking to explore?{' '}
            <Link
              to="/visitor"
              className="text-primary-500 hover:text-primary-600 transition-colors"
            >
              Enter Visitor Room
            </Link>
          </p>
        </div>
      </form>
    </FormWrapper>
  );
};

export default Login;
