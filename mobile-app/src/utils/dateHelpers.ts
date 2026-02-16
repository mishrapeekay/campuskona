import { format, parseISO, isValid, differenceInDays, addDays, subDays } from 'date-fns';
import { DATE_FORMATS } from '@/constants';

export const formatDate = (date: string | Date, formatStr: string = DATE_FORMATS.DISPLAY): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDateForAPI = (date: Date): string => {
  return format(date, DATE_FORMATS.API);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
};

export const formatTimeOnly = (date: string | Date): string => {
  return formatDate(date, DATE_FORMATS.TIME_ONLY);
};

export const getDaysDifference = (date1: string | Date, date2: string | Date): number => {
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInDays(d1, d2);
  } catch (error) {
    console.error('Error calculating days difference:', error);
    return 0;
  }
};

export const addDaysToDate = (date: Date, days: number): Date => {
  return addDays(date, days);
};

export const subtractDaysFromDate = (date: Date, days: number): Date => {
  return subDays(date, days);
};

export const isToday = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

export const getRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const days = differenceInDays(new Date(), dateObj);

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  } catch (error) {
    return '';
  }
};
