import { query, transaction } from '../config/database.js'
import { AppError, asyncHandler } from '../middleware/errorHandler.js'
import { authenticate } from '../middleware/auth.js'
import { validateEnrollment } from '../middleware/validators.js'
import logger from '../utils/logger.js'

// Get user's enrolled courses
export const getMyEnrollments = [
  authenticate,
  asyncHandler(async (req, res) => {
    const enrollmentsResult = await query(
      `SELECT 
         c.*,
         e.enrolled_at,
         COALESCE(COUNT(DISTINCT m.id), 0) as modules_count,
         COALESCE(COUNT(DISTINCT p.module_id) FILTER (WHERE p.completed = true), 0) as completed_modules,
         CASE WHEN COUNT(DISTINCT m.id) > 0 THEN
           ROUND(
             (COUNT(DISTINCT p.module_id) FILTER (WHERE p.completed = true) * 100.0 / COUNT(DISTINCT m.id)), 0
           )::int
         ELSE 0 END as progress
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN modules m ON c.id = m.course_id
       LEFT JOIN progress p ON m.id = p.module_id AND p.user_id = e.user_id
       WHERE e.user_id = $1
       GROUP BY c.id, e.id
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    )

    res.json({
      success: true,
      data: { enrollments: enrollmentsResult.rows }
    })
  })
]

// Enroll in a course
export const enrollInCourse = [
  authenticate,
  validateEnrollment,
  asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const userId = req.user.id

    // Check if course exists
    const courseResult = await query(
      'SELECT id, title FROM courses WHERE id = $1',
      [courseId]
    )

    if (courseResult.rows.length === 0) {
      throw new AppError('Curso não encontrado', 404, 'COURSE_NOT_FOUND')
    }

    // Check if already enrolled
    const existingEnrollment = await query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND user_id = $2',
      [courseId, userId]
    )

    if (existingEnrollment.rows.length > 0) {
      throw new AppError('Você já está matriculado neste curso', 400, 'ALREADY_ENROLLED')
    }

    // Create enrollment
    const enrollmentResult = await transaction(async (client) => {
      const result = await client.query(
        `INSERT INTO enrollments (user_id, course_id) 
         VALUES ($1, $2) 
         RETURNING id, enrolled_at`,
        [userId, courseId]
      )

      return result.rows[0]
    })

    logger.info('User enrolled in course', { userId, courseId, enrollmentId: enrollmentResult.id, requestId: req.requestId })

    res.status(201).json({
      success: true,
      message: 'Matrícula realizada com sucesso',
      data: {
        enrollment: {
          id: enrollmentResult.id,
          course_id: parseInt(courseId),
          user_id: userId,
          enrolled_at: enrollmentResult.enrolled_at
        }
      }
    })
  })
]

// Unenroll from a course
export const unenrollFromCourse = [
  authenticate,
  validateEnrollment,
  asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const userId = req.user.id

    // Check if enrolled
    const enrollmentResult = await query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND user_id = $2',
      [courseId, userId]
    )

    if (enrollmentResult.rows.length === 0) {
      throw new AppError('Você não está matriculado neste curso', 400, 'NOT_ENROLLED')
    }

    // Delete enrollment and related progress
    await transaction(async (client) => {
      await client.query(
        'DELETE FROM progress WHERE user_id = $1 AND module_id IN (SELECT id FROM modules WHERE course_id = $2)',
        [userId, courseId]
      )

      await client.query(
        'DELETE FROM enrollments WHERE course_id = $1 AND user_id = $2',
        [courseId, userId]
      )
    })

    logger.info('User unenrolled from course', { userId, courseId, requestId: req.requestId })

    res.json({
      success: true,
      message: 'Matrícula cancelada com sucesso'
    })
  })
]

export default {
  getMyEnrollments,
  enrollInCourse,
  unenrollFromCourse
}