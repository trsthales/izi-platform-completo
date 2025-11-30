import { body, param, query, validationResult } from 'express-validator'

// Handle validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array(),
      code: 'VALIDATION_ERROR'
    })
  }
  next()
}

// Auth validations
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  handleValidationErrors
]

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  
  handleValidationErrors
]

// User validations
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  handleValidationErrors
]

// Course validations
export const validateCreateCourse = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Descrição deve ter entre 10 e 2000 caracteres'),
  
  body('category')
    .optional()
    .isIn(['programming', 'design', 'marketing', 'business', 'other'])
    .withMessage('Categoria inválida'),
  
  body('duration')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Duração deve ser um número entre 1 e 10000'),

  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Nível inválido'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Preço inválido'),

  body('link')
    .optional()
    .isURL({ require_protocol: true })
    .withMessage('Link deve ser uma URL válida (incluir http:// ou https://)'),

  handleValidationErrors
]

// Validator for updating a course (all fields optional but validated if present)
export const validateUpdateCourse = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Descrição deve ter entre 10 e 2000 caracteres'),

  body('category')
    .optional()
    .isIn(['programming', 'design', 'marketing', 'business', 'other'])
    .withMessage('Categoria inválida'),

  body('duration')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Duração deve ser um número entre 1 e 10000'),

  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Nível inválido'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Preço inválido'),

  body('link')
    .optional()
    .isURL({ require_protocol: true })
    .withMessage('Link deve ser uma URL válida (incluir http:// ou https://)'),

  handleValidationErrors
]

export const validateCourseId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do curso deve ser um número inteiro positivo'),
  
  handleValidationErrors
]

// Module validations
export const validateCreateModule = [
  param('courseId')
    .isInt({ min: 1 })
    .withMessage('ID do curso deve ser um número inteiro positivo'),
  
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Título do módulo deve ter entre 3 e 200 caracteres'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ max: 50000 })
    .withMessage('Conteúdo muito longo'),
  
  body('duration')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Duração deve ser um número entre 1 e 300 minutos'),
  
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Ordem deve ser um número inteiro positivo'),
  
  handleValidationErrors
]

export const validateModuleId = [
  param('moduleId')
    .isInt({ min: 1 })
    .withMessage('ID do módulo deve ser um número inteiro positivo'),
  
  handleValidationErrors
]

// Enrollment validations
export const validateEnrollment = [
  param('courseId')
    .isInt({ min: 1 })
    .withMessage('ID do curso deve ser um número inteiro positivo'),
  
  handleValidationErrors
]

// Progress validations
export const validateUpdateProgress = [
  body('moduleId')
    .isInt({ min: 1 })
    .withMessage('ID do módulo deve ser um número inteiro positivo'),
  
  body('completed')
    .isBoolean()
    .withMessage('Campo completed deve ser um booleano'),
  
  handleValidationErrors
]

export const validateCourseProgressQuery = [
  param('courseId')
    .isInt({ min: 1 })
    .withMessage('ID do curso deve ser um número inteiro positivo'),
  
  handleValidationErrors
]

// Pagination validations
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
  
  handleValidationErrors
]

// Search validations
export const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),
  
  query('category')
    .optional()
    .isIn(['programming', 'design', 'marketing', 'business', 'other'])
    .withMessage('Categoria inválida'),
  
  handleValidationErrors
]

export default {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateCreateCourse,
  validateCourseId,
  validateCreateModule,
  validateModuleId,
  validateEnrollment,
  validateUpdateProgress,
  validateCourseProgressQuery,
  validatePagination,
  validateSearch,
  validateUpdateCourse,
  handleValidationErrors
}