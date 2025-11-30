import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { courseService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

const EditCoursePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.is_admin) return
    ;(async () => {
      try {
        setLoading(true)
        const course = await courseService.getCourse(id)
        setFormData({
          title: course.title || '',
          description: course.description || '',
          category: course.category || 'other',
          duration: course.duration || '',
          level: course.level || 'beginner',
          price: course.price || 0.0,
          icon: course.icon || '',
          thumbnail_url: course.thumbnail_url || '',
          link: course.link || '',
          is_published: course.is_published || false
        })
      } catch (err) {
        setError('Erro ao carregar curso')
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id, user])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const updated = await courseService.updateCourse(id, formData)
      navigate(`/admin/cursos`)
    } catch (err) {
      setError(err.message || 'Erro ao atualizar curso')
    } finally {
      setSaving(false)
    }
  }

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Acesso negado.</p>
      </div>
    )
  }

  if (loading || !formData) {
    return <p>Carregando...</p>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-responsive">
        <h1 className="heading-lg mb-6">Editar curso</h1>

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

          <div>
            <label className="label">Link (URL)</label>
            <input name="link" value={formData.link} onChange={handleChange} type="url" placeholder="https://..." className="input" />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} className="mr-2" />
              Publicar imediatamente
            </label>
          </div>

          <div className="mt-4">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCoursePage

