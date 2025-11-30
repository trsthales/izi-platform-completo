import express from 'express'
import courseController from '../controllers/courseController.js'
import { authenticate, authorizeAdmin } from '../middleware/auth.js'
import { validateCourseId, validateUpdateCourse } from '../middleware/validators.js'

const router = express.Router()

// Public routes
router.get('/', courseController.getAllCourses)
router.get('/:id', courseController.getCourse)

// Protected routes
router.get('/:id/modules', authenticate, courseController.getCourseModules)

// Admin-only route to create courses
router.post('/', authenticate, authorizeAdmin, courseController.createCourse)

// Admin-only route to update course
router.put('/:id', authenticate, authorizeAdmin, validateCourseId, validateUpdateCourse, courseController.updateCourse)

// Admin-only route to delete course
router.delete('/:id', authenticate, authorizeAdmin, validateCourseId, courseController.deleteCourse)

export default router