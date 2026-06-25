import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { Calendar, MapPin, Plus } from 'lucide-react';

export const EventManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      await api.get('/student/exams'); // Reuse student exams/events fetcher or similar
      // Mock events mapping
      const mockList = [
        { _id: '1', title: 'Campus Hackverse 2026', venue: 'Main Auditorium Hall A', organizer: 'CSE Club', date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) },
        { _id: '2', title: 'Future of Quantum Computing', venue: 'Seminar Hall 3', organizer: 'Research Cell', date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000) },
      ];
      setEvents(mockList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch events catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6 font-bold text-xs">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Events Planner</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Schedule hackathons, quantum seminars, and guest research lectures.</p>
        </div>
        <button onClick={() => alert('Feature coming soon')} className="flex items-center gap-2 px-3 py-2 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-all">
          <Plus className="h-4 w-4" /> Create Event
        </button>
      </div>

      {loading ? (
        <div className="h-[40vh] flex justify-center items-center"><LoadingSpinner /></div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div key={ev._id} className="p-6 rounded-3xl glass-card space-y-4">
              <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold">{ev.title}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Organizer: {ev.organizer}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2 font-normal font-sans">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Venue: {ev.venue}</span>
                </div>
              </div>
              <div className="border-t pt-3 flex justify-between text-[10px]">
                <span className="text-slate-400">Scheduled Date</span>
                <span className="text-slate-800 dark:text-slate-200">{new Date(ev.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventManagement;
