type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

function formatLog(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
  if (entry.data !== undefined) {
    return `${base} ${JSON.stringify(entry.data)}`;
  }
  return base;
}

function createEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  };
}

const logger = {
  info(message: string, data?: unknown) {
    const entry = createEntry("info", message, data);
    console.log(formatLog(entry));
  },

  warn(message: string, data?: unknown) {
    const entry = createEntry("warn", message, data);
    console.warn(formatLog(entry));
  },

  error(message: string, data?: unknown) {
    const entry = createEntry("error", message, data);
    if (process.env.NODE_ENV === "production") {
      // In production, structured JSON for log aggregators
      console.error(JSON.stringify(entry));
    } else {
      console.error(formatLog(entry));
    }
  },

  debug(message: string, data?: unknown) {
    if (process.env.NODE_ENV !== "production") {
      const entry = createEntry("debug", message, data);
      console.debug(formatLog(entry));
    }
  },
};

export default logger;
