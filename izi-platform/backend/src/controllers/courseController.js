import { query, transaction } from '../config/database.js'
import { AppError, asyncHandler } from '../middleware/errorHandler.js'
import { optionalAuth } from '../middleware/auth.js'
import { 
  validateCourseId, 
  validatePagination,
  validateSearch 
} from '../middleware/validators.js'

// Get all courses (with optional authentication)
export const getAllCourses = [
  optionalAuth,
  ...validatePagination,
  ...validateSearch,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const search = req.query.search
    const category = req.query.category
    const userId = req.user?.id

    // Build WHERE clause
    const whereConditions = []
    const values = []
    let paramCount = 0

    if (search) {
      whereConditions.push(`(c.title ILIKE $${++paramCount} OR c.description ILIKE $${paramCount})`)
      values.push(`%${search}%`)
    }

    if (category && category !== 'all') {
      whereConditions.push(`c.category = $${++paramCount}`)
      values.push(category)
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : ''

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM courses c
      ${whereClause}
    `
    
    const countResult = await query(countQuery, values)
    const total = parseInt(countResult.rows[0].total)

    // Get courses with enrollment status for authenticated users
    const coursesQuery = userId
      ? `
        SELECT 
          c.*,
          COALESCE(COUNT(DISTINCT m.id), 0) as modules_count,
          COALESCE(COUNT(DISTINCT p.module_id) FILTER (WHERE p.completed = true), 0) as completed_modules,
          CASE WHEN e.id IS NOT NULL THEN true ELSE false END as is_enrolled,
          CASE WHEN e.id IS NOT NULL THEN
            ROUND(
              (COUNT(DISTINCT p.module_id) FILTER (WHERE p.completed = true) * 100.0 / NULLIF(COUNT(DISTINCT m.id), 0)), 0
            )::int
          ELSE 0 END as progress
        FROM courses c
        LEFT JOIN modules m ON c.id = m.course_id
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = $${++paramCount}
        LEFT JOIN progress p ON m.id = p.module_id AND p.user_id = $${paramCount}
        ${whereClause}
        GROUP BY c.id, e.id
        ORDER BY c.created_at DESC
        LIMIT $${++paramCount} OFFSET $${++paramCount}
      `
      : `
        SELECT 
          c.*,
          COALESCE(COUNT(DISTINCT m.id), 0) as modules_count,
          false as is_enrolled,
          0 as progress
        FROM courses c
        LEFT JOIN modules m ON c.id = m.course_id
        ${whereClause}
        GROUP BY c.id
        ORDER BY c.created_at DESC
        LIMIT $${++paramCount} OFFSET $${++paramCount}
      `

    values.push(limit, offset)
    if (userId) {
      // The SQL uses the same parameter number for both user-related placeholders
      // (e.g. $3 used twice). We must insert the userId only once before limit/offset
      // so positional bindings stay correct.
      values.splice(-2, 0, userId)
    }

    const coursesResult = await query(coursesQuery, values)
    
    // Get student count for each course
    const coursesWithStats = await Promise.all(
      coursesResult.rows.map(async (course) => {
        const statsResult = await query(
          'SELECT COUNT(*) as student_count FROM enrollments WHERE course_id = $1',
          [course.id]
        )
        course.students = parseInt(statsResult.rows[0].student_count)
        return course
      })
    )

    res.json({
      success: true,
      data: {
        courses: coursesWithStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    })
  })
]

// Get single course
export const getCourse = [
  validateCourseId,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user?.id

    const courseQuery = userId
      ? `
        SELECT 
          c.*,
          COALESCE(COUNT(DISTINCT m.id), 0) as modules_count,
          COALESCE(COUNT(DISTINCT p.module_id) FILTER (WHERE p.completed = true), 0) as completed_modules,
          CASE WHEN e.id IS NOT NULL THEN true ELSE false END as is_enrolled,
          CASE WHEN e.id IS NOT NULL THEN
            ROUND(
              (COUNT(DISTINCT p.module_id) FILTER (WHERE p.completed = true) * 100.0 / NULLIF(COUNT(DISTINCT m.id), 0)), 0
            )::int
          ELSE 0 END as progress
        FROM courses c
        LEFT JOIN modules m ON c.id = m.course_id
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = $1
        LEFT JOIN progress p ON m.id = p.module_id AND p.user_id = $1
        WHERE c.id = $2
        GROUP BY c.id, e.id
      `
      : `
        SELECT 
          c.*,
          COALESCE(COUNT(DISTINCT m.id), 0) as modules_count,
          false as is_enrolled,
          0 as progress
        FROM courses c
        LEFT JOIN modules m ON c.id = m.course_id
        WHERE c.id = $1
        GROUP BY c.id
      `

    const courseValues = userId ? [userId, id] : [id]
    const courseResult = await query(courseQuery, courseValues)

    if (courseResult.rows.length === 0) {
      throw new AppError('Curso não encontrado', 404, 'COURSE_NOT_FOUND')
    }

    const course = courseResult.rows[0]

    // Get student count
    const statsResult = await query(
      'SELECT COUNT(*) as student_count FROM enrollments WHERE course_id = $1',
      [id]
    )
    course.students = parseInt(statsResult.rows[0].student_count)

    res.json({
      success: true,
      data: { course }
    })
  })
]

// Get course modules
export const getCourseModules = [
  validateCourseId,
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    // Check if user is enrolled
    const enrollmentResult = await query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND user_id = $2',
      [id, userId]
    )

    if (enrollmentResult.rows.length === 0) {
      throw new AppError('Você não está matriculado neste curso', 403, 'NOT_ENROLLED')
    }

    // Get modules with progress
    const modulesResult = await query(
      `SELECT 
         m.*,
         CASE WHEN p.module_id IS NOT NULL AND p.completed = true THEN true ELSE false END as is_completed
       FROM modules m
       LEFT JOIN progress p ON m.id = p.module_id AND p.user_id = $1
       WHERE m.course_id = $2
       ORDER BY m.order ASC, m.created_at ASC`,
      [userId, id]
    )

    res.json({
      success: true,
      data: { modules: modulesResult.rows }
    })
  })
]

// Create course (admin only)
export const createCourse = [
  asyncHandler(async (req, res) => {
    const { title, description, category, duration, level, price, icon, thumbnail_url, link, is_published } = req.body

    if (!title || !description) {
      throw new AppError('Título e descrição são obrigatórios', 400, 'MISSING_FIELDS')
    }

    const result = await transaction(async (client) => {
      const insertResult = await client.query(
        `INSERT INTO courses (title, description, category, duration, level, price, icon, thumbnail_url, link, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, title, description, category, duration, level, price, icon, thumbnail_url, link, is_published, created_at`,
        [title, description, category || 'other', duration || null, level || 'beginner', price || 0.0, icon || null, thumbnail_url || null, link || null, !!is_published]
      )

      return insertResult.rows[0]
    })

    res.status(201).json({
      success: true,
      message: 'Curso criado com sucesso',
      data: { course: result }
    })
  })
]

export default {
  getAllCourses,
  getCourse,
  getCourseModules,
  createCourse
}