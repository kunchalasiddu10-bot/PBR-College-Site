import React from 'react';
import { Bar, Line } from 'react-chartjs-2';


export const AnalyticsDashboard: React.FC = () => {
  const barChartData = {
    labels: ['Admissions', 'Graduates', 'Placements'],
    datasets: [
      {
        label: 'Count 2026',
        data: [360, 290, 180],
        backgroundColor: 'rgba(56, 170, 248, 0.75)',
        borderColor: '#38aaf8',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Complaint Resolution Time (Hours)',
        data: [48, 36, 24, 18, 12, 8],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6 font-bold text-xs">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Analytics Hub</h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">Generate multi-dimensional charts for student admissions, placements, and complaints.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">2026 Academic Metrics</h3>
          <Bar data={barChartData} />
        </div>

        <div className="p-6 rounded-3xl glass-card space-y-4">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Complaint Resolution Speed</h3>
          <Line data={lineChartData} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
