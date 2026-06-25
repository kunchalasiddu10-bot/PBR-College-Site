import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import Button from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass-card text-center animate-slide-up">
      <div className="mx-auto h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 mb-6">
        <HelpCircle className="h-9 w-9" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
        Page Not Found
      </h1>

      <span className="text-sm font-semibold tracking-widest text-primary-500 uppercase">
        Error Code 404
      </span>

      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-4 mb-8 leading-relaxed">
        The page you are looking for does not exist, or has been moved to a different administrative URL directory.
      </p>

      <div className="flex flex-col gap-3">
        <Button variant="primary" onClick={() => navigate('/')}>
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
