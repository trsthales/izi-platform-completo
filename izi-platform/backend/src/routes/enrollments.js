import express from 'express'
import enrollmentController from '../controllers/enrollmentController.js'

const router = express.Router()

// All routes require authentication
router.get('/my-courses', enrollmentController.getMyEnrollments)
router.post('/:courseId/enroll', enrollmentController.enrollInCourse)
router.delete('/:courseId/unenroll', enrollmentController.unenrollFromCourse)

export default router