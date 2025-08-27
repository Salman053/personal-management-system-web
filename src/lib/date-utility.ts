// utils/dateFormatter.ts

import React from "react";

/**
 * Formats a date or timestamp into a human-readable string
 * @param date - Date object, string, or timestamp
 * @param options - Formatting options
 * @returns Formatted date string
 */
export const formatDateTime = (
  date: Date | string | number,
  options: {
    type?: 'date' | 'time' | 'datetime' | 'relative';
    showSeconds?: boolean;
    locale?: string;
  } = {}
): string => {
  const {
    type = 'datetime',
    showSeconds = false,
    locale = 'en-US'
  } = options;

  // Convert to Date object if it's a string or number
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  // Check if date is valid
  if (isNaN(dateObj?.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInMs = now?.getTime() - dateObj?.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  // For relative time (e.g., "2 hours ago")
  if (type === 'relative') {
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} day${Math.floor(diffInDays) !== 1 ? 's' : ''} ago`;
    }
  }

  // For specific formats
  const dateOptions: Intl.DateTimeFormatOptions = {};
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  if (showSeconds) {
    timeOptions.second = '2-digit';
  }

  if (type === 'date') {
    dateOptions.year = 'numeric';
    dateOptions.month = 'short';
    dateOptions.day = 'numeric';
  } else if (type === 'time') {
    return dateObj.toLocaleTimeString(locale, timeOptions);
  }

  // For datetime (default)
  if (type === 'datetime' || type === 'relative') {
    dateOptions.year = 'numeric';
    dateOptions.month = 'short';
    dateOptions.day = 'numeric';

    return `${dateObj.toLocaleDateString(locale, dateOptions)} at ${dateObj.toLocaleTimeString(locale, timeOptions)}`;
  }

  return dateObj.toLocaleDateString(locale, dateOptions);
};

/**
 * Hook to use formatted date with automatic updates for relative time
 */
export const useFormattedDate = (
  date: Date | string | number,
  options: {
    type?: 'date' | 'time' | 'datetime' | 'relative';
    showSeconds?: boolean;
    locale?: string;
    updateInterval?: number; // in milliseconds
  } = {}
): string => {
  const [formattedDate, setFormattedDate] = React.useState(
    formatDateTime(date, options)
  );

  React.useEffect(() => {
    setFormattedDate(formatDateTime(date, options));

    // Set up interval for relative time updates
    if (options.type === 'relative' && options.updateInterval) {
      const interval = setInterval(() => {
        setFormattedDate(formatDateTime(date, options));
      }, options.updateInterval);

      return () => clearInterval(interval);
    }
  }, [date, options]);

  return formattedDate;
};


export function formatDate(input: string | number | Date | [any, any, (1 | undefined)?, (0 | undefined)?, (0 | undefined)?, (0 | undefined)?, (0 | undefined)?] | null | undefined, options = {}) {
  const defaultOptions = {
    locale: 'en-US',
    dateStyle: 'long',
    timeStyle: undefined,
    timeZone: 'UTC'
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    let date;

    // Handle different input types
    if (input instanceof Date) {
      date = input;
    } else if (typeof input === 'string') {
      // Try parsing as ISO string first
      date = new Date(input);

      // If invalid, try other common formats
      if (isNaN(date.getTime())) {
        // Try parsing as timestamp
        const timestamp = Number(input);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        } else {
          // Try parsing with Date.parse (handles various formats)
          const parsed = Date.parse(input);
          if (!isNaN(parsed)) {
            date = new Date(parsed);
          } else {
            throw new Error('Invalid date string format');
          }
        }
      }
    } else if (typeof input === 'number') {
      // Handle timestamp (milliseconds since epoch)
      date = new Date(input);
    } else if (Array.isArray(input)) {
      // Handle array format [year, month, day, hours, minutes, seconds, milliseconds]
      const [year, month, day = 1, hours = 0, minutes = 0, seconds = 0, milliseconds = 0] = input;
      date = new Date(year, month, day, hours, minutes, seconds, milliseconds);
    } else if (input === undefined || input === null) {
      // Handle no input - return current date
      date = new Date();
    } else {
      throw new Error('Unsupported input type');
    }

    // Validate the date
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    // Format the date using Intl.DateTimeFormat for localization
    const formatter = new Intl.DateTimeFormat(
      finalOptions.locale,
      {
        dateStyle: finalOptions.dateStyle,
        timeStyle: finalOptions.timeStyle,
        timeZone: finalOptions.timeZone
      }
    );

    return formatter.format(date);

  } catch (error) {
    // Fallback formatting if Intl is not available or fails
    try {
      const date = input instanceof Date ? input : new Date();
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString(finalOptions.locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (fallbackError) {
      // Ultimate fallback
      return 'Invalid date format';
    }

    return 'Invalid date format';
  }
}