import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { Book, Plus } from 'lucide-react';

export const LibraryManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', author: '', isbn: '', availableCopies: 5 });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/library/books');
      setBooks(res.data.data.books);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch library inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/library/books', formData);
      setShowModal(false);
      fetchBooks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error adding book.');
    }
  };

  return (
    <div className="space-y-6 font-bold text-xs">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Library Management</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Catalog library books, copies count, and ISBN identifiers.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-3 py-2 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-all">
          <Plus className="h-4 w-4" /> Add Book
        </button>
      </div>

      {loading ? (
        <div className="h-[40vh] flex justify-center items-center"><LoadingSpinner /></div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((b) => (
            <div key={b._id} className="p-6 rounded-3xl glass-card space-y-4">
              <div className="h-10 w-10 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center">
                <Book className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{b.title}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Author: {b.author}</p>
                <p className="text-[10px] text-slate-450 font-semibold font-mono">ISBN: {b.isbn}</p>
              </div>
              <div className="border-t pt-3 flex justify-between text-[10px]">
                <span className="text-slate-400">Available copies</span>
                <span className="text-slate-800 dark:text-slate-200">{b.availableCopies} Books</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-extrabold border-b pb-2">Add Catalog Book</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-slate-400">Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-slate-400">Author</label>
                <input required type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">ISBN</label>
                  <input required type="text" value={formData.isbn} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Available Copies</label>
                  <input required type="number" min={0} value={formData.availableCopies} onChange={(e) => setFormData({ ...formData, availableCopies: parseInt(e.target.value) || 0 })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryManagement;
