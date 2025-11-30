import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'izi-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'izi-secret-key')
  } catch (error) {
    throw new Error('Token inválido')
  }
}

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de acesso necessário',
        code: 'MISSING_TOKEN'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const decoded = verifyToken(token)
    
    // Fetch user from database including is_admin
    const userResult = await query(
      'SELECT id, name, email, is_admin, created_at FROM users WHERE id = $1',
      [decoded.userId]
    )
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      })
    }

    req.user = userResult.rows[0]
    next()
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido ou expirado',
      code: 'INVALID_TOKEN'
    })
  }
}

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = verifyToken(token)
      
      const userResult = await query(
        'SELECT id, name, email, is_admin, created_at FROM users WHERE id = $1',
        [decoded.userId]
      )
      
      if (userResult.rows.length > 0) {
        req.user = userResult.rows[0]
      }
    }
  } catch (error) {
    // Silently continue without authentication
  }
  
  next()
}

// Authorization middleware for admin-only routes
export const authorizeAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Token de acesso necessário', code: 'MISSING_TOKEN' })
    }

    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Acesso restrito a administradores', code: 'ADMIN_ONLY' })
    }

    next()
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao verificar permissão de administrador', code: 'ADMIN_CHECK_ERROR' })
  }
}

// Check if user owns resource
export const checkResourceOwnership = (resourceField = 'user_id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params.resourceId
      const userId = req.user.id
      
      const resource = await query(
        `SELECT ${resourceField} FROM resources WHERE id = $1`,
        [resourceId]
      )
      
      if (resource.rows.length === 0) {
        return res.status(404).json({
          error: 'Recurso não encontrado',
          code: 'RESOURCE_NOT_FOUND'
        })
      }
      
      if (resource.rows[0][resourceField] !== userId) {
        return res.status(403).json({
          error: 'Acesso negado',
          code: 'ACCESS_DENIED'
        })
      }
      
      req.resource = resource.rows[0]
      next()
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao verificar permissão',
        code: 'PERMISSION_CHECK_ERROR'
      })
    }
  }
}

export default {
  generateToken,
  verifyToken,
  authenticate,
  optionalAuth,
  checkResourceOwnership,
  authorizeAdmin
}