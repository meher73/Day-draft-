/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Search,
  TrendingUp,
  Award,
  Download,
  Upload,
  FileSpreadsheet,
  Info,
  Tag,
  Clock,
  AlertTriangle,
  BookOpen,
  CalendarDays,
  FileDown,
  Pin
} from 'lucide-react';
import { DayRecord, AppState, CATEGORY_PRESETS } from '../types';
import {
  formatDateStr,
  getCalendarColorClass,
  addDays,
  getLocalDateString
} from '../utils/dateUtils';
import {
  calculateStreak,
  getWeeklyCompletionData,
  getMonthlyStats,
  getCategoryPerformance
} from '../utils/statsUtils';
import { exportToCSV, downloadBackup, parseBackupFile } from '../utils/exportUtils';

interface CalendarViewProps {
  appState: AppState;
  onRestoreState: (restored: AppState) => void;
  todayDateStr: string;
}

export default function CalendarView({
  appState,
  onRestoreState,
  todayDateStr,
}: CalendarViewProps) {
  const { history } = appState;

  // Active dates
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedDate, setSelectedDate] = useState<string | null>(todayDateStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  // Streak data
  const { currentStreak, longestStreak } = useMemo(() => {
    return calculateStreak(history, todayDateStr);
  }, [history, todayDateStr]);

  // Category performance
  const categoryPerformance = useMemo(() => {
    return getCategoryPerformance(history);
  }, [history]);

  // Weekly graph data
  const weeklyData = useMemo(() => {
    return getWeeklyCompletionData(history, todayDateStr);
  }, [history, todayDateStr]);

  // Monthly stats
  const monthlyStats = useMemo(() => {
    return getMonthlyStats(history, currentYear, currentMonth);
  }, [history, currentYear, currentMonth]);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate calendar grid dates
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: { dateStr: string | null; dateNum: number | null }[] = [];

    // Padding for days of previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dateStr: null, dateNum: null });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dateNum: d });
    }

    return days;
  }, [currentYear, currentMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Selected date details
  const selectedRecord = selectedDate ? history[selectedDate] : null;

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const matches: { dateStr: string; record: DayRecord; matchingTaskName?: string }[] = [];

    Object.entries(history).forEach(([dateStr, record]) => {
      // Check if date matches
      if (dateStr.includes(query)) {
        matches.push({ dateStr, record });
        return;
      }

      // Check notes
      if (record.notes?.toLowerCase().includes(query)) {
        matches.push({ dateStr, record });
        return;
      }

      // Check tasks
      const matchingTask = record.tasks.find(
        t => t.title.toLowerCase().includes(query) || (t.notes && t.notes.toLowerCase().includes(query))
      );

      if (matchingTask) {
        matches.push({
          dateStr,
          record,
          matchingTaskName: matchingTask.title
        });
      }
    });

    // Sort chronologically reverse
    return matches.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [history, searchQuery]);

  // Handle backup restore file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFileError(null);
      const restoredState = await parseBackupFile(file);
      onRestoreState(restoredState);
      alert('Data restored successfully! Your offline-first database is up to date.');
    } catch (err: any) {
      setFileError(err.message || 'Failed to restore data.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Streaks & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 transition-colors flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-widest">
              Current Streak
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {currentStreak}
              </span>
              <span className="text-xs font-semibold text-slate-500">days</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {currentStreak >= 3 ? "You're on fire! Keep it going 🔥" : 'Complete tasks at ≥50% to build streaks'}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-slate-800 dark:text-slate-200 shrink-0">
            <Flame className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 transition-colors flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-widest">
              Longest Streak
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {longestStreak}
              </span>
              <span className="text-xs font-semibold text-slate-500">days</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Your all-time consecutive record
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-slate-800 dark:text-slate-200 shrink-0">
            <Award className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Favorite/Most Completed Category */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 transition-colors flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-widest">
              Top Category
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-950 dark:text-slate-100 max-w-[150px] truncate block">
                {categoryPerformance[0]?.category || 'None yet'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {categoryPerformance[0]
                ? `${categoryPerformance[0].avgCompletion}% average completion across ${categoryPerformance[0].count} runs`
                : 'Plan & complete tasks to see category performance'}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-slate-800 dark:text-slate-200 shrink-0">
            <TrendingUp className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Heatmap vs Selected Date Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Column (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 transition-colors space-y-4">
            {/* Header controls */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <CalendarIcon className="w-4.5 h-4.5 text-slate-900 dark:text-white" />
                <span>
                  {monthNames[currentMonth - 1]} {currentYear}
                </span>
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((day, idx) => {
                  if (!day.dateStr) {
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="aspect-square bg-transparent rounded-lg border border-transparent"
                      />
                    );
                  }

                  const record = history[day.dateStr];
                  const hasTasks = record && record.tasks.length > 0;
                  const score = hasTasks ? record.dailyPercentage : undefined;
                  const isSelected = selectedDate === day.dateStr;
                  const isToday = todayDateStr === day.dateStr;

                  const colorStyles = getCalendarColorClass(score);

                  return (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={day.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(day.dateStr)}
                      className={`aspect-square ${colorStyles.bg} border ${
                        isSelected
                          ? 'ring-2 ring-slate-950 dark:ring-white border-slate-950 dark:border-white'
                          : isToday
                          ? 'border-slate-900 dark:border-slate-100 border-2'
                          : 'border-slate-100/50 dark:border-slate-900/10'
                      } rounded-xl p-1 flex flex-col items-center justify-center relative cursor-pointer group transition-all`}
                      title={`${day.dateStr}: ${colorStyles.label}`}
                    >
                      <span className="text-xs font-bold z-10">{day.dateNum}</span>
                      {score !== undefined && (
                        <span className="absolute bottom-1.5 w-1 h-1 bg-current opacity-70 rounded-full" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Color Legend (GitHub contribution scale) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                Completion Legend:
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 font-mono">
                <span>0%</span>
                <div className="w-3.5 h-3.5 bg-slate-100/50 rounded-xs border border-slate-200" title="0%" />
                <div className="w-3.5 h-3.5 bg-slate-200/50 rounded-xs border border-slate-300" title="1-24%" />
                <div className="w-3.5 h-3.5 bg-slate-300/60 rounded-xs border border-slate-400" title="25-49%" />
                <div className="w-3.5 h-3.5 bg-slate-400/70 rounded-xs border border-slate-500" title="50-74%" />
                <div className="w-3.5 h-3.5 bg-slate-600 rounded-xs border border-slate-600" title="75-89%" />
                <div className="w-3.5 h-3.5 bg-slate-900 dark:bg-slate-100 rounded-xs border border-slate-900 dark:border-slate-100" title="90-100%" />
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Search any past date or task */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 transition-colors space-y-3">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search Past Drafts & Records</span>
            </h4>
            <div className="relative">
              <input
                type="text"
                placeholder="Search task title, category, note or date (YYYY-MM-DD)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white focus:border-slate-900 dark:focus:border-white transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            {/* Search results list */}
            {searchQuery.trim() !== '' && (
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-105 dark:border-slate-800/60 max-h-56 overflow-y-auto space-y-2">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
                    No matching results found for "{searchQuery}"
                  </p>
                ) : (
                  searchResults.map(({ dateStr, record, matchingTaskName }) => {
                    const dateMeta = formatDateStr(dateStr);
                    return (
                      <button
                        key={dateStr}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSearchQuery('');
                        }}
                        className="w-full text-left bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 rounded-lg hover:border-slate-900 dark:hover:border-white transition-all flex justify-between items-center group cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white">
                            {dateMeta.fullDate}
                          </div>
                          {matchingTaskName && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 italic">
                              Matches task: "{matchingTaskName}"
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {record.dailyPercentage}% Complete
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Details Column (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 transition-colors space-y-4"
              >
                {/* Selected Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {formatDateStr(selectedDate).fullDate}
                    </h3>
                    <p className="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                      {formatDateStr(selectedDate).dayName.toUpperCase()}
                    </p>
                  </div>

                  <div
                    className={`px-3 py-1 text-xs font-mono font-bold rounded-lg ${
                      getCalendarColorClass(selectedRecord ? selectedRecord.dailyPercentage : undefined).bg
                    }`}
                  >
                    {selectedRecord && selectedRecord.tasks.length > 0
                      ? `${selectedRecord.dailyPercentage}%`
                      : 'No Record'}
                  </div>
                </div>

                {/* Task Checklist details */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                    Tasks & Metrics
                  </h4>

                  {!selectedRecord || selectedRecord.tasks.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                      <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                      No tasks logged or planned for this date.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {selectedRecord.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex items-start gap-2.5"
                        >
                          {task.pinned && (
                            <Pin className="w-3 h-3 text-slate-900 dark:text-white shrink-0 mt-1 fill-slate-900 dark:fill-white" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="text-[9px] font-bold font-mono uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-slate-500 dark:text-slate-400">
                                {task.category || 'General'}
                              </span>
                              <span className="text-[9px] font-bold font-mono uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-slate-500 dark:text-slate-400">
                                {task.priority}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                              {task.title}
                            </h5>
                            {task.notes && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                                {task.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                            {task.completion}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Journal Review Note details */}
                {selectedRecord && selectedRecord.notes && (
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                      <span>Journal Entries</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      "{selectedRecord.notes}"
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center h-48">
                <Info className="w-8 h-8 text-slate-400 mb-2" />
                Select any date on the calendar to view logged checklists and performance metrics.
              </div>
            )}
          </AnimatePresence>

          {/* Weekly Graph Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 transition-colors space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
              Weekly Completion Graph
            </h4>

            <div className="flex justify-between items-end h-28 pt-2">
              {weeklyData.map((day) => (
                <div key={day.dateStr} className="flex flex-col items-center flex-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[10px] py-1 px-1.5 rounded-md font-mono whitespace-nowrap z-30">
                    {day.percentage}%
                  </div>

                  {/* Column fill */}
                  <div className="w-6 md:w-8 bg-slate-100 dark:bg-slate-800 rounded-md h-20 flex items-end overflow-hidden border border-slate-200/30 dark:border-slate-800/80">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${day.percentage}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`w-full rounded-b-md ${
                        day.percentage >= 90
                          ? 'bg-slate-900 dark:bg-slate-100'
                          : day.percentage >= 75
                          ? 'bg-slate-600 dark:bg-slate-300'
                          : day.percentage >= 50
                          ? 'bg-slate-400 dark:bg-slate-500'
                          : day.percentage >= 25
                          ? 'bg-slate-300 dark:bg-slate-700'
                          : day.percentage > 0
                          ? 'bg-slate-200 dark:bg-slate-800'
                          : 'bg-transparent'
                      }`}
                    />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 mt-2 truncate max-w-[40px]">
                    {day.dayLabel.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSV Export, Backup & Restore Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 transition-colors space-y-4">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
          Backup, Restore & Exports
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Day Draft operates entirely locally on your device. Use these utilities to back up your journal entries, sync with other browsers, or download your history as a spreadsheet.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => exportToCSV(history)}
            className="flex items-center justify-center gap-2 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <span>Export History as CSV</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => downloadBackup(appState)}
            className="flex items-center justify-center gap-2 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <span>Download Backup JSON</span>
          </motion.button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              id="restore-file-input"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="flex items-center justify-center gap-2 border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-100 dark:hover:bg-slate-900 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 text-center">
              <Upload className="w-4 h-4 text-slate-400" />
              <span>Upload Backup JSON</span>
            </div>
          </div>
        </div>

        {fileError && (
          <p className="text-xs text-rose-500 font-semibold">{fileError}</p>
        )}
      </div>
    </div>
  );
}
