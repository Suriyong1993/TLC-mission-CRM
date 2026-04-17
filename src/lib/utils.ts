// Utility functions for TLC-mission CRM

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export function formatThaiDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return d.toLocaleDateString('th-TH', options);
}

export function getCurrentWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
}

export function getISOWeek(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Body colors
export const bodyColors: Record<string, string> = {
  'body_1': '#3b82f6', // เมือง 1 - Blue
  'body_2': '#06b6d4', // เมือง 2 - Cyan
  'body_3': '#8b5cf6', // สมเด็จ - Purple
  'body_4': '#10b981', // ท่าคันโท - Green
  'body_5': '#f59e0b', // กุฉินารายณ์ - Amber
  'body_6': '#ec4899', // คำใหญ่ - Pink
};

export const bodyNames: Record<string, string> = {
  'body_1': 'เมือง 1',
  'body_2': 'เมือง 2',
  'body_3': 'สมเด็จ',
  'body_4': 'ท่าคันโท',
  'body_5': 'กุฉินารายณ์',
  'body_6': 'คำใหญ่',
};

// Pillar colors
export const pillarColors: Record<number, string> = {
  1: '#f97316', // การประกาศ - Orange
  2: '#3b82f6', // การติดตามผล - Blue
  3: '#10b981', // การอภิบาล - Green
  4: '#8b5cf6', // สร้างผู้นำ - Purple
  5: '#ec4899', // อธิษฐานพุธ - Pink
  6: '#06b6d4', // พพช. - Teal
  7: '#f59e0b', // มาคจ. - Amber
  8: '#ef4444', // มาแคร์ - Red
};

export const pillarNames: Record<number, string> = {
  1: 'การประกาศ',
  2: 'การติดตามผล',
  3: 'การอภิบาล',
  4: 'การสร้างผู้นำ',
  5: 'อธิษฐานเช้าพุธ',
  6: 'การเข้า พพช.',
  7: 'การมาคริสตจักร',
  8: 'การมาแคร์กรุ๊ป',
};

// Size classification
export function classifyGroupSize(count: number): {
  size: 'BIG' | 'STD' | 'MINI' | 'EMPTY';
  color: string;
} {
  if (count >= 12) return { size: 'BIG', color: '#10b981' };
  if (count >= 7) return { size: 'STD', color: '#06b6d4' };
  if (count >= 1) return { size: 'MINI', color: '#8b5cf6' };
  return { size: 'EMPTY', color: '#6b7280' };
}

// Number formatter
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('th-TH').format(num);
}

// Percentage calculation
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
