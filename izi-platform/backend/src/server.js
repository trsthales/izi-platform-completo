import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

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

// Security middleware
app.use(helmet())

// Request ID - ensure this runs before any logging/CORS
app.use(requestIdMiddleware)

// CORS configuration
const frontendEnv = process.env.FRONTEND_URL || ''
const frontendListEnv = process.env.FRONTEND_URLS || ''
// Build allowed origins list: support single FRONTEND_URL or comma-separated FRONTEND_URLS
const allowedOrigins = new Set(
  [
    'http://localhost:3000', // keep local dev by default
    ...(frontendEnv ? [frontendEnv] : []),
    ...((frontendListEnv || '').split(',').map(s => s.trim()).filter(Boolean))
  ]
)

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, same-origin)
    if (!origin) return callback(null, true)
    if (allowedOrigins.has(origin)) {
      return callback(null, true)
    }
    // For debugging, you can log the rejected origin
    logger && logger.warn && logger.warn('CORS origin denied', { origin })
    return callback(new Error('CORS policy: This origin is not allowed'))
  },
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
// Ensure OPTIONS preflight requests are handled
app.options('*', cors(corsOptions))

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

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }))
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
  console.error('Global error:', error)
  
  res.status(error.status || 500).json({
    error: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    }),
    timestamp: new Date().toISOString()
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`
🚀 IZI Backend API Server
🌐 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Port: ${PORT}
📚 API Base URL: http://localhost:${PORT}/api
⚡ Health Check: http://localhost:${PORT}/health

Available endpoints:
🔐 /api/auth - Authentication (login, register)
👤 /api/users - User management
📚 /api/courses - Courses management
🎓 /api/enrollments - Course enrollments
📊 /api/progress - User progress tracking
    `)
  })
}

export default app