import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export const FacultyTimetable: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState<string>(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return today === 'Sunday' ? 'Monday' : today;
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const res = await api.get('/faculty/timetable');
        setTimetable(res.data.data.timetable);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch teaching schedule.');
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading teaching schedule...</p>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} className="max-w-2xl mx-auto" />;
  }

  const filteredSlots = timetable
    .filter((slot) => slot.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Teaching Schedule
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Review weekly slots, allocated lecture halls, and sections schedules.
        </p>
      </div>

      {/* Week Day Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none shrink-0">
        {weekDays.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeDay === day
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-500 hover:text-slate-700'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Grid of classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSlots.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl glass-card space-y-4">
            <div className="mx-auto h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-slate-800 dark:text-white">No Lectures Scheduled</p>
              <p className="text-xs text-slate-400">You are free from teaching on {activeDay}!</p>
            </div>
          </div>
        ) : (
          filteredSlots.map((slot) => (
            <div key={slot._id} className="p-6 rounded-3xl glass-card hover:shadow-md transition space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-500">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {slot.subject?.code}
                </span>
              </div>

              <div className="space-y-1 pt-2">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-snug">
                  {slot.subject?.name}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {slot.startTime} - {slot.endTime}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" /> Room {slot.room}
                </span>
                <span>Semester {slot.semester} • Section {slot.section}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FacultyTimetable;
