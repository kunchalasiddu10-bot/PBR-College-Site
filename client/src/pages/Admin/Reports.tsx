import React from 'react';
import { BarChart3, FileSpreadsheet } from 'lucide-react';

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6 font-bold text-xs">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Reports Exporter</h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">Export institutional summary registers, enrollment logs, and placement statistics to PDF or CSV.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl">
        <div className="p-6 rounded-3xl glass-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold mt-3">Roster Enrollment PDF Report</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Generates a detailed summary of all students, faculty counts, and departments.</p>
          </div>
          <button onClick={() => alert('PDF generation initiated')} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl">
            Export PDF Register
          </button>
        </div>

        <div className="p-6 rounded-3xl glass-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold mt-3">Placement Records CSV Ledger</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Export a tabular list of student placements, recruiters, packages, and eligibility.</p>
          </div>
          <button onClick={() => alert('CSV file generation initiated')} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl">
            Export CSV Ledger
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
