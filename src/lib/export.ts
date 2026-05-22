/**
 * Client-side CSV export utilities.
 * Generates a CSV file from any array of objects and triggers a download.
 */

// Accept any object shape — values are coerced to string when escaping.
type Row = Record<string, unknown>;

interface Column<T> {
  key: keyof T | string;
  label: string;
  formatter?: (row: T) => string | number;
}

/**
 * Convert any value to a CSV-safe string.
 * - Escapes double quotes
 * - Wraps in quotes if contains comma, newline, or quote
 */
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV<T extends object>(
  rows: T[],
  columns: Column<T>[],
  filename: string
): void {
  if (typeof window === 'undefined') return;

  // Header row
  const header = columns.map((c) => csvEscape(c.label)).join(',');

  // Data rows
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = c.formatter ? c.formatter(row) : (row as Row)[c.key as string];
          return csvEscape(val);
        })
        .join(',')
    )
    .join('\n');

  // UTF-8 BOM so Excel opens Arabic correctly
  const csv = '﻿' + header + '\n' + body;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
