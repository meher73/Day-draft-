/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarDays,
  Sparkles,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Clock,
  CheckCircle,
  Bell,
  X,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { AppState, Task, DayRecord, Priority } from './types';
import { getLocalDateString, addDays } from './utils/dateUtils';
import TomorrowPlan from './components/TomorrowPlan';
import TodayReview from './components/TodayReview';
import CalendarView from './components/CalendarView';

// Key used in local storage
const STORAGE_KEY = 'day_draft_state_v1';

// Generate dynamic local dates relative to current local time
const todayStr = getLocalDateString(new Date());
const yesterdayStr = addDays(todayStr, -1);
const day2AgoStr = addDays(todayStr, -2);
const day3AgoStr = addDays(todayStr, -3);
const day4AgoStr = addDays(todayStr, -4);
const day5AgoStr = addDays(todayStr, -5);
const tomorrowStr = addDays(todayStr, 1);

// Standard seed data to show immediately how beautiful the heatmap & statistics are
const SEED_DATA: AppState = {
  history: {
    [day5AgoStr]: {
      date: day5AgoStr,
      tasks: [
        { id: 't5-1', title: 'Study Biology', notes: 'Cell division diagrams', priority: 'High', expectedDuration: '2 hours', completion: 100, category: 'Study', pinned: true },
        { id: 't5-2', title: 'Gym Workout', notes: 'Leg day routine', priority: 'Medium', expectedDuration: '1 hour', completion: 100, category: 'Exercise' },
        { id: 't5-3', title: 'Read 20 Pages', notes: 'Clean Code Chapter 3', priority: 'Low', expectedDuration: '30 mins', completion: 100, category: 'Reading' }
      ],
      dailyPercentage: 100,
      notes: 'Completed every single goal today! Feeling amazing and energized.'
    },
    [day4AgoStr]: {
      date: day4AgoStr,
      tasks: [
        { id: 't4-1', title: 'Work on Coding Project', notes: 'Fix auth bugs', priority: 'High', expectedDuration: '3 hours', completion: 50, category: 'Work', pinned: true },
        { id: 't4-2', title: 'Quick Morning Jog', notes: 'Around the local park', priority: 'Medium', expectedDuration: '30 mins', completion: 0, category: 'Exercise' },
        { id: 't4-3', title: 'Deep Breathing Meditate', notes: 'Calm mind exercise', priority: 'Low', expectedDuration: '15 mins', completion: 50, category: 'Health' }
      ],
      dailyPercentage: 33,
      notes: 'Got distracted in the afternoon, but made some decent progress on coding.'
    },
    [day3AgoStr]: {
      date: day3AgoStr,
      tasks: [
        { id: 't3-1', title: 'Complete Physics Revision', notes: 'Thermodynamics problems', priority: 'High', expectedDuration: '2 hours', completion: 100, category: 'Study', pinned: true },
        { id: 't3-2', title: 'Read 20 Pages', notes: 'Clean Code Chapter 4', priority: 'Low', expectedDuration: '45 mins', completion: 100, category: 'Reading' },
        { id: 't3-3', title: 'Prep Healthy Lunch', notes: 'Salad and chicken breasts', priority: 'Medium', expectedDuration: '1 hour', completion: 50, category: 'Health' },
        { id: 't3-4', title: 'Clean Apartment', notes: 'Vacuum and dust shelves', priority: 'Low', expectedDuration: '30 mins', completion: 100, category: 'Personal' }
      ],
      dailyPercentage: 88,
      notes: 'Very productive day! Checked off almost everything on my radar.'
    },
    [day2AgoStr]: {
      date: day2AgoStr,
      tasks: [
        { id: 't2-1', title: 'Study Chemistry', notes: 'Organic chemistry functional groups', priority: 'High', expectedDuration: '2 hours', completion: 0, category: 'Study', pinned: true },
        { id: 't2-2', title: 'Run 5k', notes: 'Keep steady pace', priority: 'Medium', expectedDuration: '40 mins', completion: 0, category: 'Exercise' }
      ],
      dailyPercentage: 0,
      notes: 'Felt very tired and spent the day resting. Will make up for it tomorrow.'
    },
    [yesterdayStr]: {
      date: yesterdayStr,
      tasks: [
        { id: 't1-1', title: 'Study Biology', notes: 'DNA replication revision', priority: 'High', expectedDuration: '2 hours', completion: 100, category: 'Study', pinned: true },
        { id: 't1-2', title: 'Gym leg day', notes: 'Squats and lunges', priority: 'Medium', expectedDuration: '1 hour', completion: 75, category: 'Exercise' },
        { id: 't1-3', title: 'Read 20 Pages', notes: 'Clean Code Chapter 5', priority: 'Low', expectedDuration: '30 mins', completion: 50, category: 'Reading' }
      ],
      dailyPercentage: 75,
      notes: 'Felt much better today, caught up on some important biology work.'
    },
    [todayStr]: {
      date: todayStr,
      tasks: [
        { id: 't-1', title: 'Study Biology', notes: 'Chapter 5 photosynthesis', priority: 'High', expectedDuration: '2 hours', completion: 0, category: 'Study', pinned: true },
        { id: 't-2', title: 'Exercise', notes: 'Full body stretching', priority: 'Medium', expectedDuration: '45 mins', completion: 0, category: 'Exercise' },
        { id: 't-3', title: 'Complete Physics Revision', notes: 'Practice questions on motion', priority: 'High', expectedDuration: '1.5 hours', completion: 0, category: 'Study' },
        { id: 't-4', title: 'Read 20 Pages', notes: 'Read philosophy book', priority: 'Low', expectedDuration: '30 mins', completion: 0, category: 'Reading' }
      ],
      dailyPercentage: 0,
      notes: ''
    }
  },
  tomorrowPlan: {
    date: tomorrowStr,
    tasks: [
      { id: 'tp-1', title: 'Practice Coding Algorithms', notes: 'Two-pointer technique patterns', priority: 'High', expectedDuration: '2 hours', completion: 0, category: 'Work', pinned: true },
      { id: 'tp-2', title: 'Evening Stretch & Meditate', notes: 'Relax body before sleep', priority: 'Low', expectedDuration: '20 mins', completion: 0, category: 'Exercise' }
    ]
  },
  settings: {
    theme: 'light',
    reminders: {
      night: true,
      morning: true,
      nightTime: '21:30',
      morningTime: '07:30'
    }
  }
};

export default function App() {
  const [state, setState] = useState<AppState>(SEED_DATA);
  const [activeTab, setActiveTab] = useState<'tomorrow' | 'today' | 'calendar'>('today');
  const [showSettings, setShowSettings] = useState(false);
  const [reminderToast, setReminderToast] = useState<{ message: string; subtext: string } | null>(null);

  // Load state from localStorage on mount and check midnight rollover
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let parsed: AppState;

      if (stored) {
        parsed = JSON.parse(stored);
      } else {
        parsed = SEED_DATA;
      }

      // Check Midnight / Rollover logic
      const freshToday = getLocalDateString(new Date());
      const freshTomorrow = addDays(freshToday, 1);

      // If the tomorrowPlan's date is no longer in the future (i.e. it is today or in the past)
      if (parsed.tomorrowPlan.date <= freshToday) {
        const plannedDate = parsed.tomorrowPlan.date;

        // Carry tasks from TomorrowPlan into History as Today's active review list
        if (parsed.tomorrowPlan.tasks.length > 0) {
          parsed.history[plannedDate] = {
            date: plannedDate,
            tasks: parsed.tomorrowPlan.tasks.map(t => ({ ...t, completion: 0 })),
            dailyPercentage: 0,
            notes: ''
          };
        }

        // Reset tomorrow's draft date and empty its task list
        parsed.tomorrowPlan = {
          date: freshTomorrow,
          tasks: []
        };
      }

      // Make sure today's date exists in history
      if (!parsed.history[freshToday]) {
        parsed.history[freshToday] = {
          date: freshToday,
          tasks: [],
          dailyPercentage: 0,
          notes: ''
        };
      }

      setState(parsed);

      // Apply theme
      if (parsed.settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

    } catch (e) {
      console.error('Failed to load storage state:', e);
      setState(SEED_DATA);
    }
  }, []);

  // Save state to localStorage whenever it changes
  const saveState = (newState: AppState) => {
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to save state to storage:', e);
    }
  };

  // Toggle Dark & Light Mode
  const handleToggleTheme = () => {
    const nextTheme = state.settings.theme === 'light' ? 'dark' : 'light';
    const updated = {
      ...state,
      settings: {
        ...state.settings,
        theme: nextTheme
      }
    };

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    saveState(updated);
  };

  // Restores entire AppState from upload
  const handleRestoreState = (restored: AppState) => {
    // Merge restored keys
    const updated = {
      ...state,
      history: { ...state.history, ...restored.history },
      tomorrowPlan: restored.tomorrowPlan || state.tomorrowPlan,
      settings: restored.settings || state.settings
    };
    saveState(updated);
  };

  // Clears all data, leaving a clean empty state
  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to clear all trial/seed data and start completely fresh? This will permanently erase all existing checklists and history.")) {
      const emptyState: AppState = {
        history: {
          [todayStr]: {
            date: todayStr,
            tasks: [],
            dailyPercentage: 0,
            notes: ''
          }
        },
        tomorrowPlan: {
          date: tomorrowStr,
          tasks: []
        },
        settings: state.settings
      };
      saveState(emptyState);
      setShowSettings(false);
    }
  };

  // --- Tomorrow Plan Actions ---
  const handleAddTomorrowTask = (newTask: Omit<Task, 'completion'>) => {
    const task: Task = { ...newTask, completion: 0 };
    const updated = {
      ...state,
      tomorrowPlan: {
        ...state.tomorrowPlan,
        tasks: [...state.tomorrowPlan.tasks, task]
      }
    };
    saveState(updated);
  };

  const handleDeleteTomorrowTask = (id: string) => {
    const updated = {
      ...state,
      tomorrowPlan: {
        ...state.tomorrowPlan,
        tasks: state.tomorrowPlan.tasks.filter(t => t.id !== id)
      }
    };
    saveState(updated);
  };

  const handleTogglePinTomorrow = (id: string) => {
    const updated = {
      ...state,
      tomorrowPlan: {
        ...state.tomorrowPlan,
        tasks: state.tomorrowPlan.tasks.map(t =>
          t.id === id ? { ...t, pinned: !t.pinned } : t
        )
      }
    };
    saveState(updated);
  };

  // --- Today Review Actions ---
  const handleUpdateTodayTaskCompletion = (id: string, completion: number) => {
    const currentTodayStr = getLocalDateString(new Date());
    const dayRecord = state.history[currentTodayStr] || {
      date: currentTodayStr,
      tasks: [],
      dailyPercentage: 0,
      notes: ''
    };

    const updatedTasks = dayRecord.tasks.map(t =>
      t.id === id ? { ...t, completion } : t
    );

    // Re-calculate average completion score
    const totalCompletion = updatedTasks.reduce((sum, t) => sum + t.completion, 0);
    const avg = updatedTasks.length > 0 ? Math.round(totalCompletion / updatedTasks.length) : 0;

    const updated = {
      ...state,
      history: {
        ...state.history,
        [currentTodayStr]: {
          ...dayRecord,
          tasks: updatedTasks,
          dailyPercentage: avg
        }
      }
    };
    saveState(updated);
  };

  const handleAddTodayTask = (newTask: Omit<Task, 'completion'>) => {
    const currentTodayStr = getLocalDateString(new Date());
    const dayRecord = state.history[currentTodayStr] || {
      date: currentTodayStr,
      tasks: [],
      dailyPercentage: 0,
      notes: ''
    };

    const task: Task = { ...newTask, completion: 0 };
    const updatedTasks = [...dayRecord.tasks, task];

    const totalCompletion = updatedTasks.reduce((sum, t) => sum + t.completion, 0);
    const avg = Math.round(totalCompletion / updatedTasks.length);

    const updated = {
      ...state,
      history: {
        ...state.history,
        [currentTodayStr]: {
          ...dayRecord,
          tasks: updatedTasks,
          dailyPercentage: avg
        }
      }
    };
    saveState(updated);
  };

  const handleDeleteTodayTask = (id: string) => {
    const currentTodayStr = getLocalDateString(new Date());
    const dayRecord = state.history[currentTodayStr];
    if (!dayRecord) return;

    const updatedTasks = dayRecord.tasks.filter(t => t.id !== id);
    const totalCompletion = updatedTasks.reduce((sum, t) => sum + t.completion, 0);
    const avg = updatedTasks.length > 0 ? Math.round(totalCompletion / updatedTasks.length) : 0;

    const updated = {
      ...state,
      history: {
        ...state.history,
        [currentTodayStr]: {
          ...dayRecord,
          tasks: updatedTasks,
          dailyPercentage: avg
        }
      }
    };
    saveState(updated);
  };

  const handleUpdateTodayNotes = (notes: string) => {
    const currentTodayStr = getLocalDateString(new Date());
    const dayRecord = state.history[currentTodayStr] || {
      date: currentTodayStr,
      tasks: [],
      dailyPercentage: 0,
      notes: ''
    };

    const updated = {
      ...state,
      history: {
        ...state.history,
        [currentTodayStr]: {
          ...dayRecord,
          notes
        }
      }
    };
    saveState(updated);
  };

  const handleTogglePinToday = (id: string) => {
    const currentTodayStr = getLocalDateString(new Date());
    const dayRecord = state.history[currentTodayStr];
    if (!dayRecord) return;

    const updated = {
      ...state,
      history: {
        ...state.history,
        [currentTodayStr]: {
          ...dayRecord,
          tasks: dayRecord.tasks.map(t =>
            t.id === id ? { ...t, pinned: !t.pinned } : t
          )
        }
      }
    };
    saveState(updated);
  };

  // --- Setting updates ---
  const handleUpdateSettings = (reminders: AppState['settings']['reminders']) => {
    const updated = {
      ...state,
      settings: {
        ...state.settings,
        reminders
      }
    };
    saveState(updated);
  };

  // Simulated notification preview for craftsmanship points
  const triggerNotificationPreview = (type: 'morning' | 'night') => {
    if (type === 'morning') {
      setReminderToast({
        message: '🌅 Rise & Shine: Today\'s Draft is Ready!',
        subtext: `Your plan for today has been moved automatically to Today's Review. Get ready to win the day!`
      });
    } else {
      setReminderToast({
        message: '🌙 Reflection Time: Draft Tomorrow',
        subtext: 'Before you sleep, draft your tasks for tomorrow. Keep consistency building!'
      });
    }

    setTimeout(() => {
      setReminderToast(null);
    }, 6000);
  };

  const currentTodayRecord = state.history[todayStr] || {
    date: todayStr,
    tasks: [],
    dailyPercentage: 0,
    notes: ''
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors pb-24 md:pb-28">
      {/* Top Header Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-40 transition-colors">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black dark:bg-slate-100 text-white dark:text-black rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <span>Day Draft</span>
                <span className="text-[9px] font-bold font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 px-1.5 py-0.5 rounded">
                  OFFLINE-FIRST
                </span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans mt-0.5">
                Plan Tomorrow. Review Today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Light/Dark Toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 cursor-pointer transition-all"
              title="Toggle Theme"
              id="theme-toggle-btn"
            >
              {state.settings.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Settings trigger */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 cursor-pointer transition-all"
              title="Settings & Reminders"
              id="settings-btn"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace container */}
      <main className="max-w-4xl mx-auto w-full px-6 pt-8 flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'tomorrow' && (
            <motion.div
              key="tomorrow-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <TomorrowPlan
                tomorrowDateStr={state.tomorrowPlan.date}
                tasks={state.tomorrowPlan.tasks}
                onAddTask={handleAddTomorrowTask}
                onDeleteTask={handleDeleteTomorrowTask}
                onTogglePin={handleTogglePinTomorrow}
              />
            </motion.div>
          )}

          {activeTab === 'today' && (
            <motion.div
              key="today-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <TodayReview
                todayDateStr={todayStr}
                tasks={currentTodayRecord.tasks}
                dailyPercentage={currentTodayRecord.dailyPercentage}
                dailyNotes={currentTodayRecord.notes || ''}
                onUpdateTaskCompletion={handleUpdateTodayTaskCompletion}
                onAddTaskToToday={handleAddTodayTask}
                onDeleteTaskFromToday={handleDeleteTodayTask}
                onUpdateDailyNotes={handleUpdateTodayNotes}
                onTogglePinToday={handleTogglePinToday}
              />
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <CalendarView
                appState={state}
                onRestoreState={handleRestoreState}
                todayDateStr={todayStr}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Interactive Toast Notifications Preview */}
      <AnimatePresence>
        {reminderToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-4 max-w-sm bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 rounded-2xl p-4 shadow-xl z-50 flex gap-3.5 items-start"
          >
            <div className="bg-indigo-50 dark:bg-indigo-950/60 p-2 rounded-xl text-indigo-600 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                {reminderToast.message}
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {reminderToast.subtext}
              </p>
            </div>
            <button
              onClick={() => setReminderToast(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation Tab bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 dark:to-transparent pointer-events-none z-45">
        <div className="max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm p-2 flex items-center justify-around pointer-events-auto">
          {/* Tab 1: Tomorrow Plan */}
          <button
            type="button"
            onClick={() => setActiveTab('tomorrow')}
            className={`flex flex-col items-center gap-1 py-2 px-3 flex-1 cursor-pointer transition-all border-b-2 ${
              activeTab === 'tomorrow'
                ? 'text-slate-950 dark:text-white font-bold border-slate-950 dark:border-white'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 border-transparent'
            }`}
            id="tab-tomorrow"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Tomorrow</span>
          </button>

          {/* Tab 2: Today Review */}
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center gap-1 py-2 px-3 flex-1 cursor-pointer transition-all border-b-2 ${
              activeTab === 'today'
                ? 'text-slate-950 dark:text-white font-bold border-slate-950 dark:border-white'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 border-transparent'
            }`}
            id="tab-today"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Today's Review</span>
          </button>

          {/* Tab 3: Calendar */}
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center gap-1 py-2 px-3 flex-1 cursor-pointer transition-all border-b-2 ${
              activeTab === 'calendar'
                ? 'text-slate-950 dark:text-white font-bold border-slate-950 dark:border-white'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 border-transparent'
            }`}
            id="tab-calendar"
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Calendar</span>
          </button>
        </div>
      </div>

      {/* Settings Modal (Overlay) */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Configuration & Reminders
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Reminders section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                  Reminders Settings
                </h4>

                {/* Night Reminder */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2.5 items-start">
                      <Moon className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          Night Reminder
                        </span>
                        <span className="text-[10px] text-slate-500">
                          "Plan tomorrow before you sleep"
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={state.settings.reminders.night}
                      onChange={(e) =>
                        handleUpdateSettings({
                          ...state.settings.reminders,
                          night: e.target.checked
                        })
                      }
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  {state.settings.reminders.night && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/80 justify-between">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">Reminder Time:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={state.settings.reminders.nightTime}
                          onChange={(e) =>
                            handleUpdateSettings({
                              ...state.settings.reminders,
                              nightTime: e.target.value
                            })
                          }
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => triggerNotificationPreview('night')}
                          className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer"
                        >
                          Test Alert
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Morning Reminder */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2.5 items-start">
                      <Sun className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          Morning Reminder
                        </span>
                        <span className="text-[10px] text-slate-500">
                          "Today's plan is active and ready"
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={state.settings.reminders.morning}
                      onChange={(e) =>
                        handleUpdateSettings({
                          ...state.settings.reminders,
                          morning: e.target.checked
                        })
                      }
                      className="w-4 h-4 text-amber-600 border-slate-300 rounded-sm focus:ring-amber-500 cursor-pointer"
                    />
                  </div>

                  {state.settings.reminders.morning && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/80 justify-between">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">Reminder Time:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={state.settings.reminders.morningTime}
                          onChange={(e) =>
                            handleUpdateSettings({
                              ...state.settings.reminders,
                              morningTime: e.target.value
                            })
                          }
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => triggerNotificationPreview('morning')}
                          className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/50 cursor-pointer"
                        >
                          Test Alert
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Core explanation */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3.5 text-xs border border-slate-200/40 dark:border-slate-800 text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <AlertCircle className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
                <p className="leading-relaxed">
                  These alarms execute in-app when scheduled. We recommend pinning Day Draft to your bookmarks or screen to sustain daily drafts and consistency!
                </p>
              </div>

              {/* Danger Zone: Clear Seed Data */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5">
                <h4 className="text-xs font-bold text-red-500/80 dark:text-red-400/80 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Clear Seed / Trial Data</span>
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  Want to clear the sample biology study tasks and workout logs? This will wipe the app empty so you can fill in your own real habits and targets.
                </p>
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset App & Erase Trial Data</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Save Settings
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
