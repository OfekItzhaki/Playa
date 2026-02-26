type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogCategory = 'storage' | 'scheduling' | 'notification' | 'deeplink' | 'validation' | 'general';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, unknown>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogLevel, category: LogCategory, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context,
    };

    this.logs.push(entry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    const logMethod = level === 'error' ? console.error : 
                     level === 'warn' ? console.warn : 
                     console.log;

    logMethod(`[${level.toUpperCase()}] [${category}] ${message}`, context || '');
  }

  debug(category: LogCategory, message: string, context?: Record<string, unknown>) {
    this.log('debug', category, message, context);
  }

  info(category: LogCategory, message: string, context?: Record<string, unknown>) {
    this.log('info', category, message, context);
  }

  warn(category: LogCategory, message: string, context?: Record<string, unknown>) {
    this.log('warn', category, message, context);
  }

  error(category: LogCategory, message: string, context?: Record<string, unknown>) {
    this.log('error', category, message, context);
  }

  getLogs(level?: LogLevel, category?: LogCategory): LogEntry[] {
    return this.logs.filter((log) => {
      if (level && log.level !== level) return false;
      if (category && log.category !== category) return false;
      return true;
    });
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
