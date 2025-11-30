import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { courseService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

const CreateCoursePage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    duration: '',
    level: 'beginner',
    price: 0.0,
    icon: '',
    thumbnail_url: '',
    is_published: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Acesso negado. Apenas administradores podem criar cursos.</p>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const course = await courseService.createCourse(formData)
      navigate(`/curso/${course.id}`)
    } catch (err) {
      setError(err.message || 'Erro ao criar curso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-responsive">
        <h1 className="heading-lg mb-6">Criar novo curso</h1>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
          <div>
            <label className="label">Título</label>
            <input name="title" value={formData.title} onChange={handleChange} className="input" required />
          </div>

          <div>
            <label className="label">Descrição</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="input" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Categoria</label>
              <select name="category" value={formData.category} onChange={handleChange} className="input">
                <option value="programming">Programação</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="business">Negócios</option>
                <option value="other">Outros</option>
              </select>
            </div>

            <div>
              <label className="label">Nível</label>
              <select name="level" value={formData.level} onChange={handleChange} className="input">
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Duração (minutos)</label>
              <input name="duration" value={formData.duration} onChange={handleChange} type="number" className="input" />
            </div>
            <div>
              <label className="label">Preço (BRL)</label>
              <input name="price" value={formData.price} onChange={handleChange} type="number" step="0.01" className="input" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} className="mr-2" />
              Publicar imediatamente
            </label>
          </div>

          <div className="mt-4">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Criando...' : 'Criar Curso'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCoursePage

