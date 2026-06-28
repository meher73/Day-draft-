/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Clock, Tag, AlertTriangle, Pin, Calendar, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { Task, Priority, CATEGORY_PRESETS, PRIORITY_COLORS } from '../types';
import { formatDateStr } from '../utils/dateUtils';

interface TomorrowPlanProps {
  tomorrowDateStr: string;
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'completion'>) => void;
  onDeleteTask: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export default function TomorrowPlan({
  tomorrowDateStr,
  tasks,
  onAddTask,
  onDeleteTask,
  onTogglePin,
}: TomorrowPlanProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [duration, setDuration] = useState('1 hour');
  const [category, setCategory] = useState('General');
  const [isPinned, setIsPinned] = useState(false);

  const formattedDate = formatDateStr(tomorrowDateStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      id: crypto.randomUUID(),
      title: title.trim(),
      notes: notes.trim(),
      priority,
      expectedDuration: duration || 'Unspecified',
      category,
      pinned: isPinned,
    });

    // Reset Form
    setTitle('');
    setNotes('');
    setPriority('Medium');
    setDuration('1 hour');
    setCategory('General');
    setIsPinned(false);
    setShowAddForm(false);
  };

  // Sort tasks: pinned first, then by priority (High -> Medium -> Low), then alphabetical
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (weightDiff !== 0) return weightDiff;

    return a.title.localeCompare(b.title);
  });

  return (
    <div className="space-y-6">
      {/* Date Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase font-mono block mb-1.5">
              Tomorrow's Draft
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {formattedDate.dayName}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-0.5">
              {formattedDate.fullDate}
            </p>
          </div>
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-800 dark:text-slate-200">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Task list section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>Tomorrow's Drafts</span>
            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </h3>

          {!showAddForm && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-sm font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              id="btn-add-task-tomorrow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </motion.button>
          )}
        </div>

        {/* Add Task Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 transition-all"
            >
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Study Biology, Gym, Physics Revision..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white focus:border-slate-900 dark:focus:border-white transition-all"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white focus:border-slate-900 dark:focus:border-white transition-all"
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                    Expected Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 hours, 45 mins"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white focus:border-slate-900 dark:focus:border-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {(['Low', 'Medium', 'High'] as Priority[]).map((pri) => (
                      <button
                        key={pri}
                        type="button"
                        onClick={() => setPriority(pri)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          priority === pri
                            ? 'bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 border-slate-950 dark:border-white font-semibold shadow-xs'
                            : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                      >
                        {pri}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <input
                    type="checkbox"
                    id="pin-task-checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4.5 h-4.5 text-slate-950 dark:text-white border-slate-300 rounded-sm focus:ring-slate-950 cursor-pointer"
                  />
                  <label
                    htmlFor="pin-task-checkbox"
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer select-none"
                  >
                    <Pin className="w-3.5 h-3.5 text-slate-400" /> Pin to top of list
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                  Optional Notes
                </label>
                <textarea
                  placeholder="Any details, sub-tasks, or materials needed..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white focus:border-slate-900 dark:focus:border-white transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Draft Task
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {sortedTasks.length === 0 && !showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl"
          >
            <div className="bg-indigo-50 dark:bg-indigo-950/50 p-4 rounded-full text-indigo-500 dark:text-indigo-400 mb-4 animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Plan Tomorrow, Relieve Today
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md">
              Draft your goals, projects, and activities before you sleep. Tomorrow, these will automatically appear as your daily checklist.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Draft your first task
            </button>
          </motion.div>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`bg-white dark:bg-slate-900 border ${
                  task.pinned
                    ? 'border-slate-900 dark:border-slate-100 bg-slate-50/50 dark:bg-slate-950/50'
                    : 'border-slate-100 dark:border-slate-800/80'
                } rounded-2xl p-6 flex items-start gap-4 transition-all group`}
              >
                {/* Pin Button */}
                <button
                  type="button"
                  onClick={() => onTogglePin(task.id)}
                  className={`mt-1 hover:scale-110 active:scale-95 transition-all cursor-pointer ${
                    task.pinned ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700 hover:text-slate-500'
                  }`}
                  title={task.pinned ? 'Unpin Task' : 'Pin Task'}
                >
                  <Pin className={`w-4 h-4 ${task.pinned ? 'fill-slate-900 dark:fill-white text-slate-900 dark:text-white' : ''}`} />
                </button>

                {/* Task Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {/* Category */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-950 text-[9px] font-bold uppercase tracking-widest font-mono text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                      <Tag className="w-2.5 h-2.5 text-slate-400" /> {task.category || 'General'}
                    </span>

                    {/* Priority */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest font-mono border ${
                        task.priority === 'High'
                          ? 'bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40'
                          : task.priority === 'Medium'
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40'
                          : 'bg-slate-50/50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <AlertTriangle className="w-2.5 h-2.5 opacity-80" /> {task.priority}
                    </span>

                    {/* Duration */}
                    {task.expectedDuration && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-semibold font-mono bg-slate-50/50 dark:bg-slate-950/30 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/80">
                        <Clock className="w-2.5 h-2.5 text-slate-400" /> {task.expectedDuration}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {task.title}
                  </h4>

                  {task.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {task.notes}
                    </p>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="text-slate-300 hover:text-rose-500 dark:text-slate-700 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 self-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Delete Draft"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Pro tip banner */}
      <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/20 rounded-xl p-4 flex items-start gap-2.5 transition-colors">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <span className="font-semibold">Midnight Automatic Flow:</span> These drafts will automatically activate tomorrow as active checklists. No manual copying needed. Rest easy!
        </div>
      </div>
    </div>
  );
}
