import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export const SystemSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      setSettings(res.data.data.settings);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/admin/settings', settings);
      alert('System settings updated successfully.');
      fetchSettings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update settings.');
    }
  };

  if (loading) return <div className="h-[40vh] flex justify-center items-center"><LoadingSpinner /></div>;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="space-y-6 font-bold text-xs">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">ERP System Settings</h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">Configure college profile parameters, contact information, and working calendars.</p>
      </div>

      <form onSubmit={handleUpdate} className="p-6 rounded-3xl glass-card max-w-xl space-y-4">
        <div>
          <label className="text-[10px] uppercase text-slate-400">College Name</label>
          <input required type="text" value={settings.collegeName} onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] uppercase text-slate-400">College Address</label>
          <input required type="text" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase text-slate-400">Contact Email</label>
            <input required type="email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] uppercase text-slate-400">Contact Phone</label>
            <input required type="text" value={settings.contactPhone} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button type="submit" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md">
            Save ERP Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;
