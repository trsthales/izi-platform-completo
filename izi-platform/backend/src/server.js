import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import * as Sentry from '@sentry/node'
import os from 'os'

// Import routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import courseRoutes from './routes/courses.js'
import enrollmentRoutes from './routes/enrollments.js'
import progressRoutes from './routes/progress.js'

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'
import logger from './utils/logger.js'
import requestIdMiddleware from './middleware/requestId.js'

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Initialize Sentry if DSN provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || 'izi-backend@1.0.0',
    serverName: os.hostname(),
    tracesSampleRate: 0.0 // disable tracing by default
  })
  // Request handler should be the first middleware
  app.use(Sentry.Handlers.requestHandler())
  app.use(Sentry.Handlers.errorHandler())
}

// Security middleware
app.use(helmet())

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
    retryAfter: '15 minutes'
  }
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request ID middleware (assigns a requestId to each request)
app.use(requestIdMiddleware)

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  // Morgan -> Winston
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }))
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/enrollments', enrollmentRoutes)
app.use('/api/progress', progressRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  })
})

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Global error', { error, requestId: req.requestId })
  if (process.env.SENTRY_DSN) {
    try { Sentry.captureException(error, { extra: { requestId: req.requestId } }) } catch (e){}
  }

  res.status(error.status || 500).json({
    error: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    }),
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info('\n🚀 IZI Backend API Server')
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
    logger.info(`Port: ${PORT}`)
    logger.info(`API Base URL: http://localhost:${PORT}/api`)
    logger.info(`Health Check: http://localhost:${PORT}/health`)
    logger.info('Available endpoints: /api/auth, /api/users, /api/courses, /api/enrollments, /api/progress')
  })
}

export default app