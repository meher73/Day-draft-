/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  notes: string;
  priority: Priority;
  expectedDuration: string; // e.g. "30 mins", "2 hours"
  completion: number; // 0, 25, 50, 75, 100
  category: string; // e.g. "Study", "Exercise", "Work", "Reading", "Health", "Personal"
  pinned?: boolean;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  dailyPercentage: number; // calculated average
  notes?: string; // Daily reflection notes
}

export interface AppState {
  history: Record<string, DayRecord>; // Key: YYYY-MM-DD
  tomorrowPlan: {
    date: string; // YYYY-MM-DD (the tomorrow being planned)
    tasks: Task[];
  };
  settings: {
    theme: 'light' | 'dark';
    reminders: {
      night: boolean; // "Plan tomorrow" reminder toggle
      morning: boolean; // "Today's plan is ready" reminder toggle
      nightTime: string; // e.g. "21:00"
      morningTime: string; // e.g. "07:00"
    };
  };
}

export const CATEGORY_PRESETS = [
  'General',
  'Study',
  'Exercise',
  'Reading',
  'Work',
  'Health',
  'Personal',
];

export const PRIORITY_COLORS = {
  High: 'border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50',
  Medium: 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
  Low: 'border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/50',
};

export const COMPLETION_COLORS = {
  0: 'bg-rose-950/20 text-rose-500 border-rose-900/30 dark:bg-rose-950/40',
  25: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30',
  50: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
  75: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
  100: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900/30',
};
