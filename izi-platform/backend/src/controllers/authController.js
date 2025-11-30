import bcrypt from 'bcryptjs'
import { query, transaction } from '../config/database.js'
import { AppError, asyncHandler } from '../middleware/errorHandler.js'
import { generateToken, authenticate } from '../middleware/auth.js'
import { validateRegister, validateLogin, validateUpdateProfile } from '../middleware/validators.js'

// Register new user
export const register = [
  validateRegister,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      throw new AppError('Email já está em uso', 400, 'EMAIL_ALREADY_EXISTS')
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const result = await transaction(async (client) => {
      const userResult = await client.query(
        `INSERT INTO users (name, email, password) 
         VALUES ($1, $2, $3) 
         RETURNING id, name, email, is_admin, created_at`,
        [name, email, hashedPassword]
      )

      return userResult.rows[0]
    })

    // Generate token
    const token = generateToken(result.id)

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: result.id,
          name: result.name,
          email: result.email,
          is_admin: result.is_admin,
          created_at: result.created_at
        },
        token
      }
    })
  })
]

// Login user
export const login = [
  validateLogin,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    // Find user
    const userResult = await query(
      'SELECT id, name, email, password, is_admin, created_at FROM users WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS')
    }

    const user = userResult.rows[0]

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS')
    }

    // Generate token
    const token = generateToken(user.id)

    // Remove password from response
    delete user.password

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          is_admin: user.is_admin,
          created_at: user.created_at
        },
        token
      }
    })
  })
]

// Get current user profile
export const getProfile = [
  authenticate,
  asyncHandler(async (req, res) => {
    const userResult = await query(
      'SELECT id, name, email, is_admin, created_at FROM users WHERE id = $1',
      [req.user.id]
    )

    if (userResult.rows.length === 0) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND')
    }

    const user = userResult.rows[0]

    // Get user statistics
    const statsResult = await query(
      `SELECT 
         COUNT(DISTINCT e.id) as enrolled_courses,
         COUNT(DISTINCT p.module_id) as completed_modules
       FROM users u
       LEFT JOIN enrollments e ON u.id = e.user_id
       LEFT JOIN progress p ON u.id = p.user_id AND p.completed = true
       WHERE u.id = $1`,
      [req.user.id]
    )

    const stats = statsResult.rows[0]

    res.json({
      success: true,
      data: {
        user,
        stats: {
          enrolled_courses: parseInt(stats.enrolled_courses) || 0,
          completed_modules: parseInt(stats.completed_modules) || 0
        }
      }
    })
  })
]

// Update user profile
export const updateProfile = [
  authenticate,
  validateUpdateProfile,
  asyncHandler(async (req, res) => {
    const { name, email } = req.body
    const userId = req.user.id

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      )

      if (existingUser.rows.length > 0) {
        throw new AppError('Email já está em uso', 400, 'EMAIL_ALREADY_EXISTS')
      }
    }

    // Build update query dynamically
    const updates = []
    const values = []
    let paramCount = 0

    if (name !== undefined) {
      updates.push(`name = $${++paramCount}`)
      values.push(name)
    }

    if (email !== undefined) {
      updates.push(`email = $${++paramCount}`)
      values.push(email)
    }

    if (updates.length === 0) {
      throw new AppError('Nenhum campo para atualizar', 400, 'NO_UPDATES')
    }

    values.push(userId)

    // Update user
    const result = await query(
      `UPDATE users 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount + 1}
       RETURNING id, name, email, created_at, updated_at`,
      values
    )

    if (result.rows.length === 0) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND')
    }

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user: result.rows[0]
      }
    })
  })
]

// Change password
export const changePassword = [
  authenticate,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      throw new AppError('Senha atual e nova senha são obrigatórias', 400, 'MISSING_PASSWORDS')
    }

    // Get current user with password
    const userResult = await query(
      'SELECT id, password FROM users WHERE id = $1',
      [req.user.id]
    )

    if (userResult.rows.length === 0) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND')
    }

    const user = userResult.rows[0]

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      throw new AppError('Senha atual incorreta', 400, 'INVALID_CURRENT_PASSWORD')
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new AppError('Nova senha deve ter pelo menos 6 caracteres', 400, 'WEAK_PASSWORD')
    }

    // Hash new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedNewPassword, req.user.id]
    )

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    })
  })
]

// Delete account
export const deleteAccount = [
  authenticate,
  asyncHandler(async (req, res) => {
    const { password } = req.body

    if (!password) {
      throw new AppError('Senha é obrigatória para excluir conta', 400, 'PASSWORD_REQUIRED')
    }

    // Get user with password
    const userResult = await query(
      'SELECT id, password FROM users WHERE id = $1',
      [req.user.id]
    )

    if (userResult.rows.length === 0) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND')
    }

    const user = userResult.rows[0]

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new AppError('Senha incorreta', 400, 'INVALID_PASSWORD')
    }

    // Delete user (cascade will handle related records)
    await query('DELETE FROM users WHERE id = $1', [user.id])

    res.json({
      success: true,
      message: 'Conta excluída com sucesso'
    })
  })
]

export default {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
}