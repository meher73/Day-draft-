/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Format a date string YYYY-MM-DD to beautiful human readable formats
export function formatDateStr(dateStr: string): {
  dayName: string;
  dayNum: string;
  monthName: string;
  year: string;
  fullDate: string;
} {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date in local time zone to avoid UTC offset shifts
  const date = new Date(year, month - 1, day);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return {
    dayName: days[date.getDay()] || '',
    dayNum: String(day),
    monthName: months[date.getMonth()] || '',
    year: String(year),
    fullDate: `${day} ${months[date.getMonth()]} ${year}`
  };
}

// Get YYYY-MM-DD for a given Date object (local time)
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Add days to a date and return local string
export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

// Get the color representing daily completion rate
// 0% - Dark Red
// 1–24% - Red
// 25–49% - Orange
// 50–74% - Yellow
// 75–89% - Light Green
// 90–100% - Dark Green
export function getCalendarColorClass(percentage: number | undefined): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  if (percentage === undefined) {
    // Empty day
    return {
      bg: 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/80 dark:hover:bg-slate-900 text-slate-300 dark:text-slate-700',
      text: 'text-slate-300 dark:text-slate-700',
      border: 'border-slate-100 dark:border-slate-900',
      label: 'No entry'
    };
  }

  if (percentage === 0) {
    return {
      bg: 'bg-slate-100/50 dark:bg-slate-900/30 text-slate-400 hover:bg-slate-200/50 border-slate-200/50 dark:border-slate-800/30',
      text: 'text-slate-400',
      border: 'border-slate-200/50 dark:border-slate-800/30',
      label: '0%'
    };
  }
  if (percentage >= 1 && percentage <= 24) {
    return {
      bg: 'bg-slate-200/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-300/50 border-slate-200/80 dark:border-slate-800/80',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200/80 dark:border-slate-800/80',
      label: '1-24%'
    };
  }
  if (percentage >= 25 && percentage <= 49) {
    return {
      bg: 'bg-slate-300/60 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 hover:bg-slate-400/50 border-slate-300/80 dark:border-slate-700/80',
      text: 'text-slate-800 dark:text-slate-200',
      border: 'border-slate-300/80 dark:border-slate-700/80',
      label: '25-49%'
    };
  }
  if (percentage >= 50 && percentage <= 74) {
    return {
      bg: 'bg-slate-400/70 dark:bg-slate-600/60 text-slate-900 dark:text-slate-100 hover:bg-slate-500/50 border-slate-400/80 dark:border-slate-600/80',
      text: 'text-slate-900 dark:text-slate-100',
      border: 'border-slate-400/80 dark:border-slate-600/80',
      label: '50-74%'
    };
  }
  if (percentage >= 75 && percentage <= 89) {
    return {
      bg: 'bg-slate-600 dark:bg-slate-400 text-white dark:text-slate-950 hover:bg-slate-700/90 border-slate-600 dark:border-slate-400',
      text: 'text-white dark:text-slate-950',
      border: 'border-slate-600 dark:border-slate-400',
      label: '75-89%'
    };
  }
  // 90-100%
  return {
    bg: 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 hover:bg-slate-950 dark:hover:bg-white border-slate-900 dark:border-slate-100',
    text: 'text-white dark:text-slate-950',
    border: 'border-slate-900 dark:border-slate-100',
    label: '90-100%'
  };
}
