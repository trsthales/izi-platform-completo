import express from 'express'
import courseController from '../controllers/courseController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', courseController.getAllCourses)
router.get('/:id', courseController.getCourse)

// Protected routes
router.get('/:id/modules', authenticate, courseController.getCourseModules)

export default router