/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Plus, BookOpen, Clock, Tag, AlertTriangle, Pin, Trash2, Edit3 } from 'lucide-react';
import { Task, Priority, CATEGORY_PRESETS, PRIORITY_COLORS } from '../types';
import { formatDateStr, getCalendarColorClass } from '../utils/dateUtils';

interface TodayReviewProps {
  todayDateStr: string;
  tasks: Task[];
  dailyPercentage: number;
  dailyNotes: string;
  onUpdateTaskCompletion: (id: string, completion: number) => void;
  onAddTaskToToday: (task: Omit<Task, 'completion'>) => void;
  onDeleteTaskFromToday: (id: string) => void;
  onUpdateDailyNotes: (notes: string) => void;
  onTogglePinToday: (id: string) => void;
}

export default function TodayReview({
  todayDateStr,
  tasks,
  dailyPercentage,
  dailyNotes,
  onUpdateTaskCompletion,
  onAddTaskToToday,
  onDeleteTaskFromToday,
  onUpdateDailyNotes,
  onTogglePinToday,
}: TodayReviewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [duration, setDuration] = useState('1 hour');
  const [category, setCategory] = useState('General');
  const [isPinned, setIsPinned] = useState(false);
  const [notes, setNotes] = useState('');

  const formattedDate = formatDateStr(todayDateStr);
  const colorMeta = getCalendarColorClass(dailyPercentage);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTaskToToday({
      id: crypto.randomUUID(),
      title: title.trim(),
      notes: notes.trim(),
      priority,
      expectedDuration: duration || 'Unspecified',
      category,
      pinned: isPinned,
    });

    setTitle('');
    setNotes('');
    setPriority('Medium');
    setDuration('1 hour');
    setCategory('General');
    setIsPinned(false);
    setShowAddForm(false);
  };

  // Sort tasks: pinned first, then by priority (High -> Medium -> Low), then completion (lower first to focus on what needs work)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (weightDiff !== 0) return weightDiff;

    return a.completion - b.completion;
  });

  return (
    <div className="space-y-6">
      {/* Today Header & Score Gauge */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase font-mono block">
              Today's Review
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {formattedDate.dayName}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              {formattedDate.fullDate}
            </p>
          </div>

          <div className="flex items-center gap-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:w-80">
            <div className="relative flex items-center justify-center shrink-0">
              {/* Outer circular indicator */}
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="stroke-slate-200 dark:stroke-slate-800 fill-none"
                  strokeWidth="5.5"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="fill-none transition-all duration-500"
                  strokeWidth="5.5"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - dailyPercentage / 100)}`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  className="text-slate-900 dark:text-white"
                />
              </svg>
              <span className="absolute font-mono text-base font-bold text-slate-900 dark:text-slate-100">
                {dailyPercentage}%
              </span>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono">
                Daily Completion
              </h4>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {tasks.length === 0
                  ? 'No tasks listed'
                  : dailyPercentage >= 90
                  ? 'Elite Focus! 🏆'
                  : dailyPercentage >= 75
                  ? 'Excellent Day! 🌟'
                  : dailyPercentage >= 50
                  ? 'Solid Consistency! 👍'
                  : dailyPercentage >= 25
                  ? 'Keep pushing! 💪'
                  : 'Let\'s start tracking 🧭'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>Today's Checklist</span>
            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </h3>

          {!showAddForm && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-sm font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Extra Task</span>
            </motion.button>
          )}
        </div>

        {/* Dynamic task creation on Today */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleAddTask}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 transition-all"
            >
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="What popped up today?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white focus:border-slate-950 dark:focus:border-white transition-all"
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
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white focus:border-slate-950 dark:focus:border-white transition-all"
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
                    placeholder="e.g. 30 mins, 2 hours"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white focus:border-slate-950 dark:focus:border-white transition-all"
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
                    id="pin-today-checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4.5 h-4.5 text-slate-950 dark:text-white border-slate-300 rounded-sm focus:ring-slate-950 cursor-pointer"
                  />
                  <label
                    htmlFor="pin-today-checkbox"
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer select-none"
                  >
                    <Pin className="w-3.5 h-3.5 text-slate-400" /> Pin to top
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                  Optional Notes
                </label>
                <textarea
                  placeholder="Quick task description..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white focus:border-slate-950 dark:focus:border-white transition-all resize-none"
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
                  Add Active Task
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Tasks list */}
        {sortedTasks.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-full text-slate-600 dark:text-slate-400 w-12 h-12 mx-auto flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-800">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              No tasks drafted for today
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
              You didn't plan any tasks yesterday. Don't worry! You can add tasks for today directly using the button above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                layoutId={`task-${task.id}`}
                className={`bg-white dark:bg-slate-900 border ${
                  task.completion === 100
                    ? 'border-emerald-500 dark:border-emerald-600 bg-emerald-50/10'
                    : task.pinned
                    ? 'border-slate-950 dark:border-slate-100 bg-slate-50/40'
                    : 'border-slate-100 dark:border-slate-800'
                } rounded-2xl p-6 transition-all group`}
              >
                <div className="flex items-start gap-4">
                  {/* Pin status / toggle */}
                  <button
                    type="button"
                    onClick={() => onTogglePinToday(task.id)}
                    className={`mt-1 transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                      task.pinned ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700 hover:text-slate-500'
                    }`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${task.pinned ? 'fill-slate-900 dark:fill-white text-slate-900 dark:text-white' : ''}`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-950 text-[9px] font-bold uppercase tracking-widest font-mono text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                        <Tag className="w-2.5 h-2.5 text-slate-400" /> {task.category || 'General'}
                      </span>

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

                      {task.expectedDuration && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-semibold font-mono bg-slate-50/50 dark:bg-slate-950/30 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/80">
                          <Clock className="w-2.5 h-2.5 text-slate-400" /> {task.expectedDuration}
                        </span>
                      )}

                      {task.completion === 100 && (
                        <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest font-mono bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/30 dark:border-emerald-900/30">
                          Completed ✅
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-base font-bold text-slate-900 dark:text-slate-50 leading-tight transition-all ${
                        task.completion === 100 ? 'line-through text-slate-400 dark:text-slate-600' : ''
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {task.notes}
                      </p>
                    )}

                    {/* Completion Buttons - Fast selectors as requested */}
                    <div className="mt-4">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-2">
                        Completion Level
                      </div>
                      <div className="flex gap-1.5 max-w-sm md:max-w-md">
                        {[0, 25, 50, 75, 100].map((val) => {
                          const isActive = task.completion === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => onUpdateTaskCompletion(task.id, val)}
                              className={`flex-1 py-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                isActive
                                  ? val === 100
                                    ? 'border-2 border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                    : val === 0
                                    ? 'border-2 border-red-200 bg-red-50 text-red-600 dark:border-red-950 dark:bg-red-950/30 dark:text-red-400'
                                    : 'border-2 border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                                  : 'border border-slate-100 dark:border-slate-800 text-slate-400 bg-slate-50 dark:bg-slate-950 hover:text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {val}%
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Delete active task if added dynamically */}
                  <button
                    type="button"
                    onClick={() => onDeleteTaskFromToday(task.id)}
                    className="text-slate-300 hover:text-rose-500 dark:text-slate-700 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer self-start"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reflections / Daily Journal Notes */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 transition-colors space-y-3">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-800 dark:text-slate-200" />
          <span>Today's Journal & Reflections</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Record a summary of what you learned, memory hooks, feelings, or obstacles you overcame today.
        </p>
        <textarea
          placeholder="Today was highly productive because... I struggled with... Tomorrow I want to focus on..."
          value={dailyNotes}
          onChange={(e) => onUpdateDailyNotes(e.target.value)}
          rows={3}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white focus:border-slate-950 dark:focus:border-white transition-all"
        />
      </div>
    </div>
  );
}
