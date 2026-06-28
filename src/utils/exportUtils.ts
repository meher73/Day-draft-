/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState, DayRecord } from '../types';

// Export history as a CSV file
export function exportToCSV(history: Record<string, DayRecord>): void {
  const headers = [
    'Date',
    'Task Title',
    'Category',
    'Priority',
    'Expected Duration',
    'Task Completion %',
    'Day Average Completion %',
    'Day Notes'
  ];

  const rows: string[][] = [];

  // Sort dates chronologically
  const sortedDates = Object.keys(history).sort();

  sortedDates.forEach(dateStr => {
    const record = history[dateStr];
    if (!record || record.tasks.length === 0) return;

    record.tasks.forEach(task => {
      rows.push([
        dateStr,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${(task.category || 'General').replace(/"/g, '""')}"`,
        task.priority,
        `"${task.expectedDuration.replace(/"/g, '""')}"`,
        `${task.completion}%`,
        `${record.dailyPercentage}%`,
        `"${(record.notes || '').replace(/"/g, '""')}"`
      ]);
    });
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `day_draft_history_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download AppState as Backup JSON file
export function downloadBackup(state: AppState): void {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `day_draft_backup_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Read and parse Backup JSON file
export function parseBackupFile(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const parsed = JSON.parse(result);

        // Simple validation to ensure it's a valid backup
        if (parsed && typeof parsed === 'object' && ('history' in parsed || 'tomorrowPlan' in parsed)) {
          resolve(parsed as AppState);
        } else {
          reject(new Error('Invalid backup file format.'));
        }
      } catch (err) {
        reject(new Error('Failed to parse backup JSON.'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading backup file.'));
    reader.readAsText(file);
  });
}
