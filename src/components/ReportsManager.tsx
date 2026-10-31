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
  const { reports, updateReportStatus, role } = useApp();
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
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'assigned':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF6EE] p-6 rounded-3xl border border-[#0B3E39]/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-black text-[#0B3E39] uppercase tracking-wide">
              Emergency Rescue Triage &amp; Dispatch Queue
            </h1>
          </div>
          <p className="text-xs text-stone-600">
            Real-time emergency intake feed with GPS auto-routing, severity escalation, and ambulance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-stone-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Emergencies ({reports.length})</option>
            <option value="reported">Reported (Pending)</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((rep) => (
          <div
            key={rep.id}
            className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-[#0B3E39]">#{rep.reportNumber}</span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${getSeverityBadge(
                    rep.severity
                  )}`}
                >
                  {rep.severity}
                </span>
              </div>

              {rep.photoUrl && (
                <img
                  src={rep.photoUrl}
                  alt={rep.description}
                  className="w-full h-32 rounded-xl object-cover border border-stone-100"
                />
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  {rep.species.toUpperCase()} • {rep.issueType.replace(/_/g, ' ')}
                </span>
                <p className="text-xs font-bold text-stone-900 mt-0.5 leading-snug">{rep.description}</p>
              </div>

              <div className="text-[11px] text-stone-500 space-y-1">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span>{rep.location.address || rep.location.wardName}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span>Reporter: {rep.isAnonymous ? 'Anonymous Citizen' : rep.reporterName}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${getStatusBadge(rep.status)}`}>
                  {rep.status.toUpperCase()}
                </span>
                <span className="text-stone-400 font-medium">
                  Priority: <strong>{rep.priorityScore}/100</strong>
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
                      className="py-1.5 bg-[#0B3E39] text-[#FAF6EE] text-[10px] font-bold rounded-lg hover:bg-[#145E56] transition cursor-pointer"
                    >
                      Dispatch Ambulance
                    </button>
                  )}
                  {rep.status !== 'resolved' && (
                    <button
                      onClick={() =>
                        updateReportStatus(rep.id, 'resolved', undefined, 'Animal treated & stabilized at center')
                      }
                      className="py-1.5 bg-emerald-700 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-800 transition cursor-pointer"
                    >
                      Mark Resolved
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
