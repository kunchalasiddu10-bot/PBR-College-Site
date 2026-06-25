import React, { useState, useEffect } from 'react';
import { BookOpen, Trash, Download, FileUp } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

export const FacultyStudyMaterials: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [materials, setMaterials] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  // Create Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const [matRes, classRes] = await Promise.all([
        api.get('/faculty/study-materials'),
        api.get('/faculty/assigned-classes')
      ]);
      setMaterials(matRes.data.data.materials);
      setClasses(classRes.data.data.assignments);
      if (classRes.data.data.assignments.length > 0) {
        setSelectedClass(classRes.data.data.assignments[0]._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch study resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeClass = classes.find((c) => c._id === selectedClass);
    if (!activeClass) return;

    try {
      setSubmitLoading(true);
      setError(null);
      setMsg(null);

      await api.post('/faculty/study-materials', {
        title,
        description,
        subject: activeClass.subject?._id,
        section: activeClass.section?._id,
        semester: activeClass.section?.semester || 3,
        fileUrl
      });

      setMsg('Study resource cataloged successfully!');
      setTitle('');
      setDescription('');
      setFileUrl('');
      fetchMaterials();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to catalog resource.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/faculty/study-materials/${id}`);
      setMsg('Resource removed successfully.');
      fetchMaterials();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete resource.');
      setLoading(false);
    }
  };

  if (loading && materials.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading resources catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Study Resources
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Catalog books, slides, research documents, and resource links.
        </p>
      </div>

      {msg && <Alert type="success" message={msg} />}
      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <form onSubmit={handleUpload} className="p-6 rounded-3xl glass-card space-y-4 h-fit">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Catalog Resource</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Class Target</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.subject?.name} - Sec {c.section?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Document Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lecture 3: Process Synchronization"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Description / Synopsis</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of contents..."
              rows={2}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Document URL Link</label>
            <input
              type="url"
              required
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="e.g. S3 PDF resources path"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            />
          </div>

          <Button type="submit" disabled={submitLoading} className="w-full flex justify-center items-center gap-2">
            {submitLoading ? <LoadingSpinner size="sm" /> : <><FileUp className="h-4.5 w-4.5" /> Catalog Document</>}
          </Button>
        </form>

        {/* Materials List */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-4">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Cataloged Resources</h3>
          {materials.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-10 w-10 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-400">No resources cataloged yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {materials.map((mat) => (
                <div key={mat._id} className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      {mat.subject?.code} • Sec {mat.section?.name}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug">{mat.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold line-clamp-2">{mat.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center text-xs">
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary-500 hover:text-primary-650 font-bold"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                    <button
                      onClick={() => handleDelete(mat._id)}
                      className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1.5"
                    >
                      <Trash className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyStudyMaterials;
