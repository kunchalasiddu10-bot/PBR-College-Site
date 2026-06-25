import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../components/ui/Button';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass-card border-red-200/50 dark:border-red-950/20 text-center animate-slide-up">
      <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-950/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mb-6 shadow-lg shadow-red-500/10">
        <ShieldAlert className="h-9 w-9" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
        Access Denied
      </h1>

      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
        Your user role does not possess the permissions required to view this administrative workspace. If you believe this is an error, please contact the IT support desk.
      </p>

      <div className="flex flex-col gap-3">
        <Button variant="primary" onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
