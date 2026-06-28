/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DayRecord, Task } from '../types';
import { getLocalDateString, addDays } from './dateUtils';

// Calculate current and longest streaks of "productive days" (daily percentage >= 50%)
export function calculateStreak(
  history: Record<string, DayRecord>,
  todayStr: string
): { currentStreak: number; longestStreak: number } {
  // Get all dates in history with dailyPercentage >= 50%
  const productiveDatesSet = new Set<string>();
  Object.entries(history).forEach(([dateStr, record]) => {
    if (record.dailyPercentage >= 50 && record.tasks.length > 0) {
      productiveDatesSet.add(dateStr);
    }
  });

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = todayStr;

  // If today is not productive, we check if yesterday was.
  // If yesterday was, the streak is alive (since today is still ongoing).
  // If neither is productive, current streak is 0.
  const isTodayProductive = productiveDatesSet.has(todayStr);
  const yesterdayStr = addDays(todayStr, -1);
  const isYesterdayProductive = productiveDatesSet.has(yesterdayStr);

  if (isTodayProductive) {
    currentStreak = 1;
    let prevDate = addDays(todayStr, -1);
    while (productiveDatesSet.has(prevDate)) {
      currentStreak++;
      prevDate = addDays(prevDate, -1);
    }
  } else if (isYesterdayProductive) {
    currentStreak = 1;
    let prevDate = addDays(yesterdayStr, -1);
    while (productiveDatesSet.has(prevDate)) {
      currentStreak++;
      prevDate = addDays(prevDate, -1);
    }
  }

  // Calculate longest streak in history
  // To do this, we get all dates, parse them, sort them, and find the max consecutive run
  const allProductiveDates = Array.from(productiveDatesSet).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const dateStr of allProductiveDates) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);

    if (lastDate === null) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    lastDate = currentDate;
  }

  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  return { currentStreak, longestStreak };
}

// Calculate weekly metrics for a given date (last 7 days ending on today)
export function getWeeklyCompletionData(
  history: Record<string, DayRecord>,
  todayStr: string
): { dayLabel: string; percentage: number; dateStr: string }[] {
  const result: { dayLabel: string; percentage: number; dateStr: string }[] = [];
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const dateStr = addDays(todayStr, -i);
    const record = history[dateStr];
    const percentage = record && record.tasks.length > 0 ? record.dailyPercentage : 0;

    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dayLabel = `${daysShort[date.getDay()]} ${d}`;

    result.push({ dayLabel, percentage, dateStr });
  }

  return result;
}

// Get monthly productivity stats for a specific Year-Month
export function getMonthlyStats(
  history: Record<string, DayRecord>,
  year: number,
  month: number // 1-indexed (1 = Jan, 12 = Dec)
): {
  averageCompletion: number;
  completedTasksCount: number;
  totalTasksCount: number;
  daysWithEntriesCount: number;
  monthlyTrend: { dateNum: number; percentage: number }[];
} {
  let totalPercentage = 0;
  let daysWithEntriesCount = 0;
  let completedTasksCount = 0;
  let totalTasksCount = 0;
  const monthlyTrend: { dateNum: number; percentage: number }[] = [];

  // Determine number of days in the month
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const record = history[dateStr];

    if (record && record.tasks.length > 0) {
      totalPercentage += record.dailyPercentage;
      daysWithEntriesCount++;

      record.tasks.forEach(t => {
        totalTasksCount++;
        if (t.completion === 100) {
          completedTasksCount++;
        }
      });

      monthlyTrend.push({
        dateNum: d,
        percentage: record.dailyPercentage,
      });
    } else {
      monthlyTrend.push({
        dateNum: d,
        percentage: 0,
      });
    }
  }

  const averageCompletion = daysWithEntriesCount > 0 ? Math.round(totalPercentage / daysWithEntriesCount) : 0;

  return {
    averageCompletion,
    completedTasksCount,
    totalTasksCount,
    daysWithEntriesCount,
    monthlyTrend,
  };
}

// Calculate the category with the highest average completion or most fully completed tasks
export function getCategoryPerformance(history: Record<string, DayRecord>): {
  category: string;
  count: number;
  avgCompletion: number;
}[] {
  const categoryStats: Record<string, { totalCompletion: number; count: number; completedCount: number }> = {};

  Object.values(history).forEach(record => {
    record.tasks.forEach(task => {
      const cat = task.category || 'General';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { totalCompletion: 0, count: 0, completedCount: 0 };
      }
      categoryStats[cat].totalCompletion += task.completion;
      categoryStats[cat].count += 1;
      if (task.completion === 100) {
        categoryStats[cat].completedCount += 1;
      }
    });
  });

  return Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      count: stats.count,
      avgCompletion: Math.round(stats.totalCompletion / stats.count),
    }))
    .sort((a, b) => b.avgCompletion - a.avgCompletion || b.count - a.count);
}
