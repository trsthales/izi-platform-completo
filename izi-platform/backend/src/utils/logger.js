import winston from 'winston'
import 'winston-daily-rotate-file'
import path from 'path'
import maskObject from './logMask.js'
import * as Sentry from '@sentry/node'

const logDir = path.resolve(process.cwd(), 'logs')

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: 'application-%DATE%.log',
  dirname: logDir,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
})

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
})

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : ''
      return `${timestamp} [${level}] ${message} ${metaString}`
    })
  ),
  transports: [dailyRotateFileTransport, consoleTransport],
  exitOnError: false
})

// If Sentry is configured, initialize and add a simple hook to forward errors
if (process.env.SENTRY_DSN) {
  try {
    Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV || 'development' })
    // forward errors to Sentry for error level logs
    logger.on('data', (log) => {
      try {
        const { level, message, ...meta } = log
        if (level === 'error' || level === 'fatal') {
          Sentry.withScope((scope) => {
            scope.setExtras(meta)
            Sentry.captureMessage(message || 'Logged error')
          })
        }
      } catch (e) {
        // ignore Sentry forwarding errors
      }
    })
  } catch (e) {
    // ignore Sentry init errors
  }
}

// Safe logging helpers: mask metadata automatically
const safeLog = (level, message, meta = {}) => {
  try {
    const maskedMeta = maskObject(meta)
    logger.log(level, message, maskedMeta)
  } catch (e) {
    // fallback to normal logging
    logger.log(level, message)
  }
}

// Convenience methods
logger.safe = (message, meta = {}) => safeLog('info', message, meta)
logger.safeInfo = (message, meta = {}) => safeLog('info', message, meta)
logger.safeWarn = (message, meta = {}) => safeLog('warn', message, meta)
logger.safeError = (message, meta = {}) => safeLog('error', message, meta)

export default logger
