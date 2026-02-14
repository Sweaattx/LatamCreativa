/**
 * Logger Utility
 * 
 * Conditional logging that only outputs in development mode.
 * In production, logs are silenced to avoid performance overhead
 * and prevent sensitive information from appearing in browser console.
 * 
 * @module utils/logger
 */

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  /** Show timestamp in logs */
  showTimestamp?: boolean;
  /** Show log level prefix */
  showLevel?: boolean;
}

const defaultOptions: LoggerOptions = {
  showTimestamp: true,
  showLevel: true,
};

function formatMessage(level: LogLevel, message: string, options: LoggerOptions): string {
  const parts: string[] = [];
  
  if (options.showTimestamp) {
    parts.push(`[${new Date().toISOString()}]`);
  }
  
  if (options.showLevel) {
    parts.push(`[${level.toUpperCase()}]`);
  }
  
  parts.push(message);
  
  return parts.join(' ');
}

/**
 * Logger instance with methods for different log levels.
 * Only outputs in development mode by default.
 */
export const logger = {
  /**
   * Debug level logging - for detailed development information
   */
  debug: (message: string, ...args: unknown[]): void => {
    if (isDev) {
      console.debug(formatMessage('debug', message, defaultOptions), ...args);
    }
  },

  /**
   * Info level logging - for general information
   */
  info: (message: string, ...args: unknown[]): void => {
    if (isDev) {
      console.info(formatMessage('info', message, defaultOptions), ...args);
    }
  },

  /**
   * Warning level logging - for potential issues
   * Also logged in production for important warnings
   */
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(formatMessage('warn', message, defaultOptions), ...args);
  },

  /**
   * Error level logging - for errors and exceptions
   * Always logged, including in production
   */
  error: (message: string, ...args: unknown[]): void => {
    console.error(formatMessage('error', message, defaultOptions), ...args);
  },

  /**
   * Log a message with custom options
   */
  log: (level: LogLevel, message: string, options?: LoggerOptions, ...args: unknown[]): void => {
    const opts = { ...defaultOptions, ...options };
    const formattedMessage = formatMessage(level, message, opts);
    
    switch (level) {
      case 'debug':
        if (isDev) console.debug(formattedMessage, ...args);
        break;
      case 'info':
        if (isDev) console.info(formattedMessage, ...args);
        break;
      case 'warn':
        console.warn(formattedMessage, ...args);
        break;
      case 'error':
        console.error(formattedMessage, ...args);
        break;
    }
  },

  /**
   * Log a group of related messages
   */
  group: (label: string, fn: () => void): void => {
    if (isDev) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },

  /**
   * Log a table (only in dev)
   */
  table: (data: unknown): void => {
    if (isDev) {
      console.table(data);
    }
  },

  /**
   * Time a function execution (only in dev)
   */
  time: (label: string): void => {
    if (isDev) {
      console.time(label);
    }
  },

  timeEnd: (label: string): void => {
    if (isDev) {
      console.timeEnd(label);
    }
  },
};

export default logger;
