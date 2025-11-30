// Custom error class
export class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.code = code
    this.isOperational = true
    
    Error.captureStackTrace(this, this.constructor)
  }
}

// Async error handler wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Main error handler middleware
export const errorHandler = (error, req, res, next) => {
  let err = { ...error }
  err.message = error.message

  // Log error
  console.error('🚨 Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  })

  // PostgreSQL errors
  if (error.code === '23505') { // Unique violation
    const message = 'Dado já existe no banco de dados'
    err = new AppError(message, 400, 'DUPLICATE_ENTRY')
  }

  if (error.code === '23503') { // Foreign key violation
    const message = 'Referência inválida no banco de dados'
    err = new AppError(message, 400, 'INVALID_REFERENCE')
  }

  if (error.code === '23502') { // Not null violation
    const message = 'Campo obrigatório não foi preenchido'
    err = new AppError(message, 400, 'MISSING_REQUIRED_FIELD')
  }

  if (error.code === '22P02') { // Invalid text representation
    const message = 'Formato de dados inválido'
    err = new AppError(message, 400, 'INVALID_DATA_FORMAT')
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    err = new AppError('Token inválido', 401, 'INVALID_TOKEN')
  }

  if (error.name === 'TokenExpiredError') {
    err = new AppError('Token expirado', 401, 'TOKEN_EXPIRED')
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(val => val.message).join(', ')
    err = new AppError(message, 400, 'VALIDATION_ERROR')
  }

  // Cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    const message = 'ID inválido'
    err = new AppError(message, 400, 'INVALID_ID')
  }

  // Default error response
  const statusCode = err.statusCode || error.statusCode || 500
  const message = err.message || 'Erro interno do servidor'

  // Don't leak error details in production
  const response = {
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  }

  // Add stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack
  }

  // Add request ID for tracking
  if (req.requestId) {
    response.requestId = req.requestId
  }

  res.status(statusCode).json(response)
}

// 404 handler
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Endpoint não encontrado: ${req.originalUrl}`,
    404,
    'ENDPOINT_NOT_FOUND'
  )
  next(error)
}

export default {
  AppError,
  asyncHandler,
  errorHandler,
  notFoundHandler
}