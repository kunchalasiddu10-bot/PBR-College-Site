import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { Briefcase, Building, Plus } from 'lucide-react';

export const PlacementManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'drives' | 'companies'>('drives');
  const [showCompModal, setShowCompModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);

  const [compForm, setCompForm] = useState({ name: '', industry: '', website: '', contactEmail: '' });
  const [driveForm, setDriveForm] = useState({ companyId: '', jobTitle: '', jobDescription: '', package: '', eligibilityCriteria: '', driveDate: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dRes, cRes] = await Promise.all([
        api.get('/admin/placements/drives'),
        api.get('/admin/placements/companies'),
      ]);
      setDrives(dRes.data.data.placementDrives);
      setCompanies(cRes.data.data.companies);
      if (cRes.data.data.companies.length > 0) {
        setDriveForm((prev) => ({ ...prev, companyId: cRes.data.data.companies[0]._id }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch placement metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/placements/companies', compForm);
      setShowCompModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating company.');
    }
  };

  const handleDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/placements/drives', driveForm);
      setShowDriveModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating drive.');
    }
  };

  return (
    <div className="space-y-6 font-bold text-xs">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Placement Hub</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Manage recruiting companies, active hiring drives, and placement statistics.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'drives' ? (
            <button onClick={() => setShowDriveModal(true)} className="flex items-center gap-2 px-3 py-2 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-all">
              <Plus className="h-4 w-4" /> Create Placement Drive
            </button>
          ) : (
            <button onClick={() => setShowCompModal(true)} className="flex items-center gap-2 px-3 py-2 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-all">
              <Plus className="h-4 w-4" /> Add Partner Company
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button onClick={() => setActiveTab('drives')} className={`pb-2 px-4 border-b-2 transition-all ${activeTab === 'drives' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400'}`}>
          Hiring Drives
        </button>
        <button onClick={() => setActiveTab('companies')} className={`pb-2 px-4 border-b-2 transition-all ${activeTab === 'companies' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400'}`}>
          Partner Companies
        </button>
      </div>

      {loading ? (
        <div className="h-[40vh] flex justify-center items-center"><LoadingSpinner /></div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : activeTab === 'drives' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.map((d) => (
            <div key={d._id} className="p-6 rounded-3xl glass-card space-y-4">
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 bg-teal-500/10 text-teal-500 rounded-2xl flex items-center justify-center">
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className={`px-2 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-800 border`}>
                  {d.status}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold">{d.jobTitle}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Company: {d.company?.name}</p>
                <p className="text-[10px] text-slate-500">{d.eligibilityCriteria}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-3 text-[10px] font-normal">
                <div>
                  <p className="text-slate-400 uppercase font-bold">Package Offered</p>
                  <p className="text-slate-800 dark:text-slate-200 text-xs font-bold mt-0.5">{d.package}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-bold">Drive Date</p>
                  <p className="text-slate-800 dark:text-slate-200 text-xs font-bold mt-0.5">{new Date(d.driveDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c) => (
            <div key={c._id} className="p-6 rounded-3xl glass-card space-y-4">
              <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold">{c.name}</h3>
                <p className="text-[10px] text-slate-450 font-semibold mt-1">Industry: {c.industry}</p>
              </div>
              <div className="text-[10px] text-slate-400 font-normal">
                <p>Website: {c.website || 'N/A'}</p>
                <p>Email: {c.contactEmail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {showCompModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-extrabold border-b pb-2">Add Partner Company</h3>
            <form onSubmit={handleCompSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-slate-400">Company Name</label>
                <input required type="text" value={compForm.name} onChange={(e) => setCompForm({ ...compForm, name: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-slate-400">Industry Segment</label>
                <input required type="text" value={compForm.industry} onChange={(e) => setCompForm({ ...compForm, industry: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Website URL</label>
                  <input type="text" value={compForm.website} onChange={(e) => setCompForm({ ...compForm, website: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Contact Email</label>
                  <input required type="email" value={compForm.contactEmail} onChange={(e) => setCompForm({ ...compForm, contactEmail: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowCompModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-extrabold border-b pb-2">Schedule Placement Drive</h3>
            <form onSubmit={handleDriveSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-slate-400">Recruiting Company</label>
                <select value={driveForm.companyId} onChange={(e) => setDriveForm({ ...driveForm, companyId: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Job Title</label>
                  <input required type="text" value={driveForm.jobTitle} onChange={(e) => setDriveForm({ ...driveForm, jobTitle: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Salary Package</label>
                  <input required type="text" value={driveForm.package} onChange={(e) => setDriveForm({ ...driveForm, package: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase text-slate-400">Eligibility Criteria</label>
                <input required type="text" placeholder="e.g. CGPA > 7.5, No backlogs" value={driveForm.eligibilityCriteria} onChange={(e) => setDriveForm({ ...driveForm, eligibilityCriteria: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Drive Date</label>
                  <input required type="date" value={driveForm.driveDate} onChange={(e) => setDriveForm({ ...driveForm, driveDate: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowDriveModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Schedule Drive</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlacementManagement;
