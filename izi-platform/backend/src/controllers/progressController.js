import {query, transaction} from '../config/database.js'
import {AppError, asyncHandler} from '../middleware/errorHandler.js'
import {authenticate} from '../middleware/auth.js'
import {validateUpdateProgress, validateCourseProgressQuery} from '../middleware/validators.js'
import logger from '../utils/logger.js'
import maskObject from '../utils/logMask.js'

// Update user progress for a module
export const updateModuleProgress = [
    authenticate,
    validateUpdateProgress,
    asyncHandler(async (req, res) => {
        logger.info('updateModuleProgress called', { requestId: req.requestId, userId: req.user?.id, body: maskObject(req.body) })
        const {moduleId, completed} = req.body
        const userId = req.user.id

        // Check if module exists and user is enrolled in the course
        const moduleResult = await query(
            `SELECT m.id, m.course_id, c.title as course_title
             FROM modules m
                      JOIN courses c ON m.course_id = c.id
             WHERE m.id = $1`,
            [moduleId]
        )

        if (moduleResult.rows.length === 0) {
            throw new AppError('Módulo não encontrado', 404, 'MODULE_NOT_FOUND')
        }

        const module = moduleResult.rows[0]

        // Check if user is enrolled in the course
        const enrollmentResult = await query(
            'SELECT id FROM enrollments WHERE course_id = $1 AND user_id = $2',
            [module.course_id, userId]
        )

        if (enrollmentResult.rows.length === 0) {
            throw new AppError('Você não está matriculado neste curso', 403, 'NOT_ENROLLED')
        }

        // Update progress
        const progressResult = await transaction(async (client) => {
            // Upsert progress record
            const result = await client.query(
                `INSERT INTO progress (user_id, module_id, completed)
                 VALUES ($1, $2, $3) ON CONFLICT (user_id, module_id)
         DO
                UPDATE SET completed = $3, updated_at = CURRENT_TIMESTAMP
                    RETURNING id, completed, created_at, updated_at`,
                [userId, moduleId, completed]
            )

            return result.rows[0]
        })

        // Calculate course progress
        const courseProgress = await query(
            `SELECT COUNT(m.id) as     total_modules,
                    COUNT(p.module_id) FILTER (WHERE p.completed = true) as completed_modules
             FROM modules m
                      LEFT JOIN progress p ON m.id = p.module_id AND p.user_id = $1
             WHERE m.course_id = $2`,
            [userId, module.course_id]
        )

        const progress = courseProgress.rows[0]
        const courseProgressPercentage = progress.total_modules > 0
            ? Math.round((progress.completed_modules / progress.total_modules) * 100)
            : 0

        res.json({
            success: true,
            message: completed ? 'Módulo marcado como concluído' : 'Progresso atualizado',
            data: {
                progress: {
                    id: progressResult.id,
                    module_id: moduleId,
                    course_id: module.course_id,
                    completed: progressResult.completed,
                    course_progress: courseProgressPercentage,
                    course_title: module.course_title
                }
            }
        })

        logger.info('updateModuleProgress success', { requestId: req.requestId, userId, moduleId, courseId: module.course_id, completed: progressResult.completed })
    })
];

// Get user's progress for a specific course
export const getCourseProgress = [
    authenticate,
    validateCourseProgressQuery,
    asyncHandler(async (req, res) => {
        logger.info('getCourseProgress called', { requestId: req.requestId, userId: req.user?.id, courseId: req.params.courseId })
        const {courseId} = req.params
        const userId = req.user.id

        // Check if user is enrolled
        const enrollmentResult = await query(
            'SELECT id FROM enrollments WHERE course_id = $1 AND user_id = $2',
            [courseId, userId]
        )

        if (enrollmentResult.rows.length === 0) {
            throw new AppError('Você não está matriculado neste curso', 403, 'NOT_ENROLLED')
        }

        // Get course modules with progress
        const modulesResult = await query(
            `SELECT m.id,
                    m.title,
                    m.duration,
                    m.order,
                    CASE WHEN p.module_id IS NOT NULL AND p.completed = true THEN true ELSE false END as completed,
                    COALESCE(p.updated_at, p.created_at)                                              as completed_at
             FROM modules m
                      LEFT JOIN progress p ON m.id = p.module_id AND p.user_id = $1
             WHERE m.course_id = $2
             ORDER BY m.order ASC, m.created_at ASC`,
            [userId, courseId]
        )

        const modules = modulesResult.rows
        const completedModules = modules.filter(m => m.completed).map(m => m.id)
        const totalModules = modules.length
        const progressPercentage = totalModules > 0
            ? Math.round((completedModules.length / totalModules) * 100)
            : 0

        res.json({
            success: true,
            data: {
                course_id: parseInt(courseId),
                total_modules: totalModules,
                completed_modules: completedModules.length,
                progress_percentage: progressPercentage,
                completed_modules_ids: completedModules,
                modules
            }
        })

        logger.info('getCourseProgress success', { requestId: req.requestId, userId, courseId, progressPercentage })
    })
]

// Get user's overall progress across all courses
export const getOverallProgress = [
    authenticate,
    asyncHandler(async (req, res) => {
        logger.info('getOverallProgress called', { requestId: req.requestId, userId: req.user?.id })
        const userId = req.user.id

        // Get progress across all enrolled courses
        const progressResult = await query(
            `SELECT c.id        as     course_id,
                    c.title     as     course_title,
                    COUNT(m.id) as     total_modules,
                    COUNT(p.module_id) FILTER (WHERE p.completed = true) as completed_modules, CASE
                                                                                                   WHEN COUNT(m.id) > 0
                                                                                                       THEN
                                                                                                       ROUND((COUNT(p.module_id) FILTER (WHERE p.completed = true) * 100.0 / COUNT(m.id)), 0)::int
         ELSE 0
            END as progress_percentage
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN modules m ON c.id = m.course_id
       LEFT JOIN progress p ON m.id = p.module_id AND p.user_id = e.user_id
       WHERE e.user_id =
            $1
            GROUP
            BY
            c
            .
            id
            ORDER
            BY
            c
            .
            title`,
            [userId]
        )

        const courses = progressResult.rows
        const totalModules = courses.reduce((sum, course) => sum + parseInt(course.total_modules), 0)
        const completedModules = courses.reduce((sum, course) => sum + parseInt(course.completed_modules), 0)
        const overallProgress = totalModules > 0
            ? Math.round((completedModules / totalModules) * 100)
            : 0

        res.json({
            success: true,
            data: {
                overall_progress: overallProgress,
                total_modules: totalModules,
                completed_modules: completedModules,
                total_courses: courses.length,
                courses
            }
        })

        logger.info('getOverallProgress success', { requestId: req.requestId, userId })
    })
]

export default {
    updateModuleProgress,
    getCourseProgress,
    getOverallProgress
}