import express from 'express'
import progressController from '../controllers/progressController.js'

const router = express.Router()

// All routes require authentication
router.put('/', progressController.updateModuleProgress)
router.get('/course/:courseId', progressController.getCourseProgress)
router.get('/overall', progressController.getOverallProgress)

export default router