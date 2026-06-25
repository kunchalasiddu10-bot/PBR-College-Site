import React, { useState } from 'react';
import { api } from '../../services/api';
import { Megaphone } from 'lucide-react';

export const Announcements: React.FC = () => {
  const [formData, setFormData] = useState({ title: '', message: '', type: 'Academic' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/announcements', formData);
      alert('Alert announcement broadcasted successfully.');
      setFormData({ title: '', message: '', type: 'Academic' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error publishing notice.');
    }
  };

  return (
    <div className="space-y-6 font-bold text-xs">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Announcements Board</h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">Broadcast academic bulletins, registration alerts, and placements notices to all student dashboard feeds.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl glass-card max-w-xl space-y-4">
        <div>
          <label className="text-[10px] uppercase text-slate-400">Bulletin Heading Title</label>
          <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] uppercase text-slate-400">Alert Category Type</label>
          <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
            <option value="Academic">Academic Schedule</option>
            <option value="Placement">Placement Notice</option>
            <option value="Event">Event Calendar</option>
            <option value="General">General Bulletin</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase text-slate-400">Broadcast Message Details</label>
          <textarea required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none resize-none" />
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button type="submit" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md flex items-center gap-1.5">
            <Megaphone className="h-4 w-4" /> Broadcast Notice
          </button>
        </div>
      </form>
    </div>
  );
};

export default Announcements;
