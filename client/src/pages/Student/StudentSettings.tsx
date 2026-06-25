import React, { useState } from 'react';
import { Bell, Shield, Save } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

export const StudentSettings: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [assignmentReminders, setAssignmentReminders] = useState(true);
  const [examNotices, setExamNotices] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Customize notifications, privacy toggles, and UI configurations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {success && (
          <Alert type="success" message="Your preference settings have been saved successfully." />
        )}

        {/* Notifications Card */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50 dark:border-slate-800/50 text-slate-800 dark:text-white">
            <Bell className="h-5 w-5 text-slate-400 shrink-0" />
            <h3 className="font-extrabold text-base">Alert Preferences</h3>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Email Notifications</label>
                <p className="text-xs text-slate-400">Receive grade updates and fee reminders via college mail.</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 text-primary-500 rounded bg-slate-100 border-slate-300 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Assignment Alerts</label>
                <p className="text-xs text-slate-400">Get notified 24 hours before homework submissions are due.</p>
              </div>
              <input
                type="checkbox"
                checked={assignmentReminders}
                onChange={(e) => setAssignmentReminders(e.target.checked)}
                className="h-4 w-4 text-primary-500 rounded bg-slate-100 border-slate-300 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Exam Schedules</label>
                <p className="text-xs text-slate-400">Receive instant push notifications when timetables or exam rooms change.</p>
              </div>
              <input
                type="checkbox"
                checked={examNotices}
                onChange={(e) => setExamNotices(e.target.checked)}
                className="h-4 w-4 text-primary-500 rounded bg-slate-100 border-slate-300 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Security Summary */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50 dark:border-slate-800/50 text-slate-800 dark:text-white">
            <Shield className="h-5 w-5 text-slate-400 shrink-0" />
            <h3 className="font-extrabold text-base">Security & Device Sessions</h3>
          </div>

          <div className="space-y-2 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <p>To refresh your session security or log out of all other active browser tablets, change your password.</p>
            <p className="text-[10px] text-slate-400 mt-2">Password updates require validation codes (to be implemented in future security phases).</p>
          </div>
        </div>

        <Button type="submit" className="w-full sm:w-auto px-8">
          <Save className="h-4 w-4" /> Save Preferences
        </Button>
      </form>
    </div>
  );
};

export default StudentSettings;
