import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone || '未设置';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}