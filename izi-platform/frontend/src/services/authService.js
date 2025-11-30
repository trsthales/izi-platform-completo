import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Configurar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    // First check for a simple token key (set by authService.login/register)
    let token = localStorage.getItem('token') || null

    // If not found, check the persisted zustand storage 'izi-auth-storage'
    if (!token) {
      const persisted = localStorage.getItem('izi-auth-storage')
      if (persisted) {
        try {
          const parsed = JSON.parse(persisted)
          // Zustand persist stores state under `state` key
          token = parsed?.state?.token || null
        } catch (e) {
          token = null
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('izi-auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password })
      // backend responds with { success, message, data: { user, token } }
      const payload = response.data?.data || response.data
      const { user, token } = payload || {}

      if (token) {
        localStorage.setItem('token', token)
      }

      return { user, token }
    } catch (error) {
      const serverMessage = error.response?.data?.error || error.response?.data?.message || null
      const err = new Error(serverMessage || error.message)
      err.details = error.response?.data?.details || null
      throw err
    }
  },

  async register(name, email, password) {
    try {
      const response = await api.post('/auth/register', { name, email, password })
      // backend responds with { success, message, data: { user, token } }
      const payload = response.data?.data || response.data
      const { user, token } = payload || {}

      if (token) {
        localStorage.setItem('token', token)
      }

      return { user, token }
    } catch (error) {
      // Prefer server-provided validation message when available
      const serverMessage = error.response?.data?.error || error.response?.data?.message || null
      const err = new Error(serverMessage || error.message)
      err.details = error.response?.data?.details || null
      throw err
    }
  },

  async getProfile() {
    const response = await api.get('/users/profile')
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('izi-auth-storage')
  },
}

export const courseService = {
  async getCourses() {
    const response = await api.get('/courses')
    // backend responds with { success, data: { courses, pagination } }
    return response.data?.data?.courses || []
  },

  async getCourse(id) {
    const response = await api.get(`/courses/${id}`)
    return response.data?.data?.course || null
  },

  async enrollCourse(courseId) {
    const response = await api.post(`/courses/${courseId}/enroll`)
    return response.data?.data?.enrollment || null
  },

  async getMyEnrollments() {
    const response = await api.get('/enrollments/my-courses')
    return response.data?.data?.enrollments || []
  },

  async getCourseModules(courseId) {
    const response = await api.get(`/courses/${courseId}/modules`)
    return response.data?.data?.modules || []
  },

  async updateProgress(moduleId, completed) {
    const response = await api.put('/progress', { moduleId, completed })
    return response.data
  },

  async getUserProgress(courseId) {
    const response = await api.get(`/progress/course/${courseId}`)
    return response.data
  },
}

export default api