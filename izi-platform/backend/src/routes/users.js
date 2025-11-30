import express from 'express'
import userController from '../controllers/userController.js'

const router = express.Router()

// Public routes (for demo - in production would require authentication)
router.get('/', userController.getAllUsers)
router.get('/:id', userController.getUserById)

export default router