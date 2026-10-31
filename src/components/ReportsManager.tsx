import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmergencyReport, ReportStatus } from '../types';
import {
  AlertTriangle,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  Ambulance,
  Phone,
  Filter,
  ShieldAlert,
} from 'lucide-react';

export const ReportsManager: React.FC = () => {
  const { reports, updateReportStatus, role, t } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(null);

  const filtered = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const getSeverityBadge = (s: EmergencyReport['severity']) => {
    switch (s) {
      case 'critical':
        return 'bg-rose-600 text-white';
      case 'high':
        return 'bg-amber-600 text-white';
      case 'medium':
        return 'bg-blue-600 text-white';
      case 'low':
      default:
        return 'bg-stone-500 text-white';
    }
  };

  const getStatusBadge = (st: ReportStatus) => {
    switch (st) {
      case 'reported':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-800';
      case 'assigned':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-800';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF6EE] dark:bg-[#0E2825] p-6 rounded-3xl border border-[#0B3E39]/15 dark:border-teal-900/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-black text-[#0B3E39] dark:text-teal-200 uppercase tracking-wide">
              {t('emergencyTitle')}
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300">
            {t('emergencySubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-stone-500 dark:text-stone-400">{t('filter')}:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-[#071E1B] border border-stone-200 dark:border-teal-900/60 rounded-xl px-3 py-2 font-semibold text-stone-700 dark:text-stone-200 focus:outline-none cursor-pointer"
          >
            <option value="all">{t('all')} ({reports.length})</option>
            <option value="reported">{t('statusReported')}</option>
            <option value="assigned">{t('statusAssigned')}</option>
            <option value="in_progress">{t('statusInProgress')}</option>
            <option value="resolved">{t('statusResolved')}</option>
          </select>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((rep) => (
          <div
            key={rep.id}
            className="bg-white dark:bg-[#0E2825] rounded-3xl p-5 border border-stone-200 dark:border-teal-900/60 shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-[#0B3E39] dark:text-teal-300">#{rep.reportNumber}</span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${getSeverityBadge(
                    rep.severity
                  )}`}
                >
                  {rep.severity === 'critical' ? t('severityCritical') : rep.severity === 'high' ? t('severityHigh') : rep.severity === 'medium' ? t('severityMedium') : t('severityLow')}
                </span>
              </div>

              {rep.photoUrl && (
                <img
                  src={rep.photoUrl}
                  alt={rep.description}
                  className="w-full h-32 rounded-xl object-cover border border-stone-100 dark:border-teal-900/40"
                />
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-teal-400/80 block">
                  {(rep.species === 'dog' ? t('dog') : rep.species === 'cat' ? t('cat') : rep.species).toUpperCase()} • {rep.issueType.replace(/_/g, ' ')}
                </span>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-0.5 leading-snug">{rep.description}</p>
              </div>

              <div className="text-[11px] text-stone-500 dark:text-stone-400 space-y-1">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 flex-shrink-0" />
                  <span>{rep.location.address || rep.location.wardName}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 flex-shrink-0" />
                  <span>{t('reporterName')}: {rep.isAnonymous ? t('anonymousReport') : rep.reporterName}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-teal-900/40 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${getStatusBadge(rep.status)}`}>
                  {rep.status === 'reported' ? t('statusReported') : rep.status === 'assigned' ? t('statusAssigned') : rep.status === 'in_progress' ? t('statusInProgress') : t('statusResolved')}
                </span>
                <span className="text-stone-400 dark:text-stone-400 font-medium">
                  {t('priority')}: <strong>{rep.priorityScore}/100</strong>
                </span>
              </div>

              {/* Status Action Buttons for NGO / Rescuer */}
              {(role === 'ngo' || role === 'admin') && (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {rep.status !== 'in_progress' && rep.status !== 'resolved' && (
                    <button
                      onClick={() =>
                        updateReportStatus(rep.id, 'in_progress', 'Bangalore Animal Care Network', 'Ambulance dispatched to site')
                      }
                      className="py-1.5 bg-[#0B3E39] dark:bg-teal-700 text-[#FAF6EE] text-[10px] font-bold rounded-lg hover:bg-[#145E56] transition cursor-pointer"
                    >
                      {t('statusAssigned')}
                    </button>
                  )}
                  {rep.status !== 'resolved' && (
                    <button
                      onClick={() =>
                        updateReportStatus(rep.id, 'resolved', undefined, 'Animal treated & stabilized at center')
                      }
                      className="py-1.5 bg-emerald-700 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-800 transition cursor-pointer"
                    >
                      {t('statusResolved')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
