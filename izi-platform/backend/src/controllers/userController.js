import { query } from '../config/database.js'
import { AppError, asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// Get all users (admin only - simplified for demo)
export const getAllUsers = [
  asyncHandler(async (req, res) => {
    logger.info('getAllUsers called', { requestId: req.requestId, userId: req.user?.id })
    const usersResult = await query(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 50'
    )

    res.json({
      success: true,
      data: { users: usersResult.rows }
    })
    logger.info('getAllUsers success', { requestId: req.requestId, returned: usersResult.rows.length })
  })
]

// Get user by ID (admin only - simplified for demo)
export const getUserById = [
  asyncHandler(async (req, res) => {
    logger.info('getUserById called', { requestId: req.requestId, userId: req.user?.id, targetId: req.params.id })
    const { id } = req.params

    const userResult = await query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [id]
    )

    if (userResult.rows.length === 0) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND')
    }

    res.json({
      success: true,
      data: { user: userResult.rows[0] }
    })

    logger.info('getUserById success', { requestId: req.requestId, targetId: id })
  })
]

export default {
  getAllUsers,
  getUserById
}