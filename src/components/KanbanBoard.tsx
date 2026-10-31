import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import {
  Kanban,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  ArrowRight,
  ArrowLeft,
  Filter,
} from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { tasks, updateTaskStatus, addTask, zones } = useApp();
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<Task['type']>('rescue');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [newAssignee, setNewAssignee] = useState('Ambulance Crew 1');
  const [newWard, setNewWard] = useState(zones[0]?.wardName || 'Ward 101 - Indiranagar');

  const columns: { id: Task['status']; title: string; color: string; border: string }[] = [
    { id: 'todo', title: 'To Do / Intake', color: 'bg-stone-100 text-stone-800', border: 'border-stone-300' },
    { id: 'in_progress', title: 'In Progress / Dispatched', color: 'bg-amber-100 text-amber-800', border: 'border-amber-300' },
    { id: 'review', title: 'Medical / Release Review', color: 'bg-blue-100 text-blue-800', border: 'border-blue-300' },
    { id: 'done', title: 'Completed & Released', color: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-300' },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (selectedWard !== 'all' && t.wardName !== selectedWard) return false;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle,
      type: newType,
      priority: newPriority,
      status: 'todo',
      assignedTo: newAssignee,
      ngoName: 'Bangalore Animal Care Network',
      wardName: newWard,
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    });

    setNewTitle('');
    setShowNewTaskModal(false);
  };

  const getPriorityBadge = (p: Task['priority']) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-600 text-white';
      case 'high':
        return 'bg-amber-500 text-white';
      case 'medium':
        return 'bg-teal-700 text-white';
      case 'low':
      default:
        return 'bg-stone-500 text-white';
    }
  };

  const advanceStatus = (current: Task['status']): Task['status'] | null => {
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'review';
    if (current === 'review') return 'done';
    return null;
  };

  const regressedStatus = (current: Task['status']): Task['status'] | null => {
    if (current === 'done') return 'review';
    if (current === 'review') return 'in_progress';
    if (current === 'in_progress') return 'todo';
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF6EE] p-6 rounded-3xl border border-[#0B3E39]/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Kanban className="w-5 h-5 text-[#0B3E39]" />
            <h1 className="text-xl font-black text-[#0B3E39] uppercase tracking-wide">
              NGO Field &amp; Rescue Taskboard
            </h1>
          </div>
          <p className="text-xs text-stone-600">
            Real-time rescue dispatches, vaccination sweeps, sterilization surgeries, and release verifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
          >
            <option value="all">All City Wards</option>
            {zones.map((z) => (
              <option key={z.id} value={z.wardName}>
                {z.wardName}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowNewTaskModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3E39] text-[#FAF6EE] text-xs font-bold hover:bg-[#145E56] transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div key={col.id} className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                <span className="text-xs font-black text-stone-800 uppercase tracking-wider">{col.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.color}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {colTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                    No active tasks in this stage
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const nextSt = advanceStatus(task.status);
                    const prevSt = regressedStatus(task.status);

                    return (
                      <div
                        key={task.id}
                        className="p-3.5 bg-stone-50 hover:bg-stone-100/80 rounded-2xl border border-stone-200 transition space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-tight">
                            {task.type}
                          </span>
                        </div>

                        <h4 className="text-xs font-black text-stone-900 leading-snug">{task.title}</h4>

                        <div className="text-[11px] text-stone-500 space-y-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3 h-3 text-stone-400" />
                            <span>{task.assignedTo}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>Due: {task.dueDate} • {task.wardName.split('-')[1] || task.wardName}</span>
                          </div>
                        </div>

                        {/* Movement Action Buttons */}
                        <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between">
                          {prevSt ? (
                            <button
                              onClick={() => updateTaskStatus(task.id, prevSt)}
                              className="p-1 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition cursor-pointer"
                              title="Move back"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span />
                          )}

                          {nextSt && (
                            <button
                              onClick={() => updateTaskStatus(task.id, nextSt)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B3E39] text-[#FAF6EE] text-[10px] font-bold hover:bg-[#145E56] transition cursor-pointer"
                            >
                              <span>Next Stage</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide mb-4">
              Dispatch New Field Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g. Vaccinate 5 stray dogs at Indiranagar 12th Main"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Operation Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  >
                    <option value="rescue">Rescue</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="sterilization">Sterilization</option>
                    <option value="release">Return-to-Site</option>
                    <option value="followup">Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Assignee</label>
                <input
                  type="text"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Ward Location</label>
                <select
                  value={newWard}
                  onChange={(e) => setNewWard(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.wardName}>
                      {z.wardName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0B3E39] text-[#FAF6EE] font-bold rounded-xl hover:bg-[#145E56] cursor-pointer"
                >
                  Create &amp; Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2.5 border border-stone-200 text-stone-600 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
