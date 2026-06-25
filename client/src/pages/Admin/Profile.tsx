import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 font-bold text-xs">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin Profile</h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">Review your administrator credentials, security tokens, and account logs.</p>
      </div>

      <div className="p-6 rounded-3xl glass-card max-w-md space-y-6">
        <div className="flex gap-4 items-center">
          <div className="h-16 w-16 rounded-3xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-extrabold text-2xl uppercase">
            {user?.name[0]}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{user?.role} Account</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-850 border rounded-2xl space-y-3 font-normal leading-relaxed text-[10px]">
          <div className="flex justify-between">
            <span className="text-slate-400 uppercase font-bold">Email Address</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 uppercase font-bold">Account Level</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold flex items-center gap-0.5"><ShieldCheck className="h-3.5 w-3.5 text-primary-500" /> Full Access</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 uppercase font-bold">Registered Date</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Profile;
