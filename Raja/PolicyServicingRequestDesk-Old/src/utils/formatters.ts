// ============================================================
// UTILITY FORMATTERS
// ============================================================
import { format, formatDistanceToNow, differenceInHours, isPast, isValid, parseISO } from 'date-fns';

export const formatDate = (date: string | Date | undefined | null, pattern = 'dd MMM yyyy'): string => {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '—';
  return format(parsed, pattern);
};

export const formatDateTime = (date: string | Date | undefined | null): string => {
  return formatDate(date, 'dd MMM yyyy, hh:mm a');
};

export const formatRelativeTime = (date: string | Date | undefined | null): string => {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '—';
  return formatDistanceToNow(parsed, { addSuffix: true });
};

export const formatCurrency = (amount: number | undefined | null, currency = 'INR'): string => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number | undefined | null): string => {
  if (num == null) return '—';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatPercentage = (value: number | undefined | null, decimals = 1): string => {
  if (value == null) return '—';
  return `${value.toFixed(decimals)}%`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatPhoneNumber = (phone: string | undefined | null): string => {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const maskPAN = (pan: string | undefined | null): string => {
  if (!pan || pan.length < 10) return '—';
  return `${pan.slice(0, 2)}XXXXXXX${pan.slice(-1)}`;
};

export const maskAccountNumber = (accountNumber: string | undefined | null): string => {
  if (!accountNumber) return '—';
  return `XXXX XXXX ${accountNumber.slice(-4)}`;
};

export const maskMobile = (mobile: string | undefined | null): string => {
  if (!mobile || mobile.length < 10) return '—';
  const cleaned = mobile.replace(/\D/g, '');
  return `XXXXXX${cleaned.slice(-4)}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

export const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getSLAStatus = (
  slaDeadline: string | undefined,
  isCompleted: boolean
): 'safe' | 'warning' | 'breached' => {
  if (!slaDeadline) return 'safe';
  if (isCompleted) return 'safe';
  const deadline = parseISO(slaDeadline);
  if (!isValid(deadline)) return 'safe';
  if (isPast(deadline)) return 'breached';
  const hoursRemaining = differenceInHours(deadline, new Date());
  if (hoursRemaining <= 4) return 'warning';
  return 'safe';
};

export const getSLAProgressPercent = (
  submittedDate: string,
  slaDeadline: string,
): number => {
  const start = parseISO(submittedDate).getTime();
  const end = parseISO(slaDeadline).getTime();
  const now = Date.now();
  if (now >= end) return 100;
  const elapsed = now - start;
  const total = end - start;
  return Math.min(100, Math.round((elapsed / total) * 100));
};

export const generateRequestNumber = (): string => {
  const prefix = 'SR';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000000) + 1000000;
  return `${prefix}${year}${random}`;
};

export const buildAddressString = (address: {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
}): string => {
  const parts = [address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean);
  return parts.join(', ');
};

export const getInitials = (name: string): string => {
  if (!name) return '??';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

export const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) result[groupKey] = [];
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
